import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

// ONE-TIME password reset for test user
export async function POST(req: NextRequest) {
  try {
    const { email, newPassword, secretKey } = await req.json()
    
    // Security: require secret key
    if (secretKey !== process.env.NEXTAUTH_SECRET?.slice(0, 20)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
    })
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })
    
    return NextResponse.json({ 
      success: true, 
      message: `Password reset for ${email}`,
      userId: user.id
    })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
