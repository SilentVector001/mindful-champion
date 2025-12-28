import { resend } from "@/lib/email/resend-client"
import { prisma } from "@/lib/db"

interface CommentNotificationParams {
  postOwnerId: string;
  postOwnerEmail: string;
  postOwnerName: string;
  commenterName: string;
  postTitle?: string;
  commentContent: string;
  postUrl?: string;
  postId?: string;
  postCaption?: string;
}

export async function sendCommentNotificationEmail(params: CommentNotificationParams): Promise<void> {
  const { postOwnerEmail, postOwnerName, commenterName, postTitle, commentContent, postUrl } = params;
  
  try {
    await resend.emails.send({
      from: 'Mindful Champion <notifications@mindfulchampion.com>',
      to: postOwnerEmail,
      subject: `${commenterName} commented on your post`,
      html: `
        <p>Hi ${postOwnerName},</p>
        <p>${commenterName} commented on your post "${postTitle}":</p>
        <blockquote>${commentContent}</blockquote>
        <p><a href="${postUrl}">View the comment</a></p>
      `
    });
  } catch (error) {
    console.error('Failed to send comment notification:', error);
  }
}
