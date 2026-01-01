import { resend } from "@/lib/email/resend-client"
import { prisma } from "@/lib/db"

interface LikeNotificationParams {
  postOwnerId: string
  postOwnerEmail: string
  postOwnerName: string
  likerName: string
  postId: string
  postCaption: string
}

export async function sendLikeNotificationEmail(params: LikeNotificationParams) {
  const {
    postOwnerId,
    postOwnerEmail,
    postOwnerName,
    likerName,
    postId,
    postCaption
  } = params

  const postUrl = `https://mindfulchampion.com/connect/community/${postId}`
  const truncatedCaption = postCaption.length > 50 ? postCaption.slice(0, 50) + "..." : postCaption

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0f172a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 32px;">
      <div style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); padding: 12px 24px; border-radius: 12px; margin-bottom: 16px;">
        <span style="color: white; font-size: 24px; font-weight: bold;">🏓 Mindful Champion</span>
      </div>
      <h1 style="color: #f1f5f9; font-size: 28px; margin: 0;">${likerName} liked your post! ❤️</h1>
    </div>

    <!-- Main Card -->
    <div style="background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%); border: 1px solid #334155; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
      <p style="color: #94a3b8; font-size: 16px; margin: 0 0 24px 0;">
        Hey <span style="color: #14b8a6; font-weight: 600;">${postOwnerName}</span>! 👋
      </p>
      
      <p style="color: #e2e8f0; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        <strong style="color: #14b8a6;">${likerName}</strong> liked your post "${truncatedCaption}"
      </p>

      <!-- Like Icon -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #f43f5e 100%); width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);">
          <span style="font-size: 40px;">❤️</span>
        </div>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="${postUrl}" style="display: inline-block; background: linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%); color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
          View Post →
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; color: #64748b; font-size: 13px;">
      <p style="margin: 0 0 8px 0;">Keep sharing great content! 🎾</p>
      <p style="margin: 0;">
        <a href="https://mindfulchampion.com/community" style="color: #14b8a6; text-decoration: none;">Visit Community Center</a>
      </p>
      <p style="margin: 16px 0 0 0; font-size: 12px; color: #475569;">
        You're receiving this because someone liked your post.<br>
        © ${new Date().getFullYear()} Mindful Champion. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`

  const textContent = `
Hey ${postOwnerName}!

${likerName} liked your post "${truncatedCaption}"! ❤️

View post: ${postUrl}

Keep sharing great content! 🎾
- The Mindful Champion Team
`

  try {
    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: "Mindful Champion <noreply@mindfulchampion.com>",
      to: postOwnerEmail,
      subject: `❤️ ${likerName} liked your post!`,
      html: htmlContent,
      text: textContent
    })

    if (error) {
      console.error("Resend error:", error)
      throw error
    }

    // Log to EmailNotification table
    await prisma.emailNotification.create({
      data: {
        userId: postOwnerId,
        type: "ADMIN_NEW_USER",
        recipientEmail: postOwnerEmail,
        subject: `${likerName} liked your post`,
        htmlContent: htmlContent,
        status: "SENT",
        sentAt: new Date(),
        metadata: {
          postId,
          likerName,
          resendId: data?.id
        }
      }
    })

    return { success: true, messageId: data?.id }
  } catch (error) {
    console.error("Failed to send like notification:", error)

    // Log failed attempt
    await prisma.emailNotification.create({
      data: {
        userId: postOwnerId,
        type: "ADMIN_NEW_USER",
        recipientEmail: postOwnerEmail,
        subject: `${likerName} liked your post`,
        htmlContent: `Failed to send like notification`,
        status: "FAILED",
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: { postId, likerName }
      }
    })

    throw error
  }
}
