
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"
import { sendWelcomeEmail } from "@/lib/email"
import { MediaCenterEmailService } from "@/lib/media-center/email-service"
import { SubscriptionTier, PromoCodeStatus } from "@prisma/client"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, firstName, lastName, skillLevel, playerRating, promoCode } = body

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Calculate trial dates (7 days from now)
    const trialStartDate = new Date()
    const trialEndDate = new Date()
    trialEndDate.setDate(trialStartDate.getDate() + 7)

    // Create user - default to TRIAL tier if no promo code
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        name: `${firstName} ${lastName}`,
        skillLevel: skillLevel || 'BEGINNER',
        playerRating: playerRating || '2.0',
        subscriptionTier: SubscriptionTier.TRIAL,
        trialStartDate,
        trialEndDate,
        isTrialActive: true,
        lastActiveDate: new Date(),
      }
    })

    // Handle promo code redemption if provided
    let promoCodeRedemption = null
    if (promoCode && promoCode.trim()) {
      try {
        // Find and validate promo code
        const validPromoCode = await prisma.promoCode.findUnique({
          where: { code: promoCode.trim().toUpperCase() }
        })

        if (validPromoCode && validPromoCode.status === PromoCodeStatus.ACTIVE) {
          // Check if promo code has reached max redemptions
          if (!validPromoCode.maxRedemptions || validPromoCode.timesRedeemed < validPromoCode.maxRedemptions) {
            // Check if code is not expired
            if (!validPromoCode.expiresAt || validPromoCode.expiresAt > new Date()) {
              // Redeem the promo code in a transaction
              await prisma.$transaction(async (tx) => {
                // Calculate new trial dates based on promo code duration
                const promoTrialStartDate = new Date()
                const promoTrialEndDate = new Date()
                promoTrialEndDate.setDate(promoTrialStartDate.getDate() + validPromoCode.durationDays)

                // Update user with promo benefits
                await tx.user.update({
                  where: { id: user.id },
                  data: {
                    subscriptionTier: SubscriptionTier.PRO,
                    trialEndDate: promoTrialEndDate,
                    trialStartDate: promoTrialStartDate,
                    isTrialActive: true,
                  }
                })

                // Update promo code usage
                await tx.promoCode.update({
                  where: { id: validPromoCode.id },
                  data: {
                    timesRedeemed: { increment: 1 },
                    status: validPromoCode.maxRedemptions && (validPromoCode.timesRedeemed + 1) >= validPromoCode.maxRedemptions 
                      ? PromoCodeStatus.REDEEMED 
                      : PromoCodeStatus.ACTIVE,
                    redeemedBy: user.email,
                    redeemedAt: new Date(),
                  }
                })

                // If it's a beta tester code, create BetaTester record
                if (validPromoCode.isBetaTester && validPromoCode.betaTasks) {
                  const tasks = validPromoCode.betaTasks as any[]
                  await tx.betaTester.create({
                    data: {
                      userId: user.id,
                      promoCodeId: validPromoCode.id,
                      status: 'ACTIVE',
                      startedAt: new Date(),
                      totalTasksRequired: tasks.length,
                      totalTasksCompleted: 0,
                      rewardEligible: false,
                      rewardClaimed: false,
                      taskProgress: tasks,
                    }
                  })
                }
              })

              promoCodeRedemption = {
                success: true,
                code: validPromoCode.code,
                description: validPromoCode.description,
                durationDays: validPromoCode.durationDays,
                isBetaTester: validPromoCode.isBetaTester,
                rewardAmount: validPromoCode.rewardAmount,
              }
              
              console.log(`✅ Promo code ${validPromoCode.code} successfully redeemed for user ${email}`)
            }
          }
        }
      } catch (promoError) {
        console.error('Error redeeming promo code during signup:', promoError)
        // Don't block signup if promo code fails - user account is already created
      }
    }

    // Send enhanced welcome email with trial info
    try {
      const emailSent = await MediaCenterEmailService.sendWelcomeEmail(user.id)
      
      if (emailSent) {
        // Update user record with email tracking
        await prisma.user.update({
          where: { id: user.id },
          data: {
            welcomeEmailSent: true,
            welcomeEmailSentAt: new Date(),
          }
        })
        console.log(`✅ Enhanced welcome email sent to ${email}`)
      } else {
        console.error(`❌ Failed to send enhanced welcome email to ${email}`)
        
        // Fallback to regular welcome email
        try {
          const fallbackResult = await sendWelcomeEmail({
            to: email,
            name: `${firstName} ${lastName}`,
            firstName,
          })
          
          if (fallbackResult.success) {
            console.log(`✅ Fallback welcome email sent to ${email}`)
          }
        } catch (fallbackError) {
          console.error('Fallback welcome email also failed:', fallbackError)
        }
      }
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError)
      // Don't block signup if email fails - user is already created
    }

    // Send notification email to admin (if origin header is available)
    try {
      const origin = req.headers.get('origin')
      if (origin) {
        const response = await fetch(`${origin}/api/send-notification`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'new_user',
            userEmail: email,
            userName: `${firstName} ${lastName}`,
            skillLevel,
            playerRating,
            signupDate: new Date().toISOString(),
          })
        })
      }
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError)
    }

    return NextResponse.json({
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        trialEndDate: user.trialEndDate,
      },
      promoCodeRedemption,
    })

  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
