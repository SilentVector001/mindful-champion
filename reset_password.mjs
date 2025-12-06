import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const newPassword = 'test123';
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const user = await prisma.user.update({
    where: { email: 'jay@aol.com' },
    data: { password: hashedPassword },
    select: {
      email: true,
      name: true,
    }
  });
  
  console.log('Password updated for:', user.email);
  console.log('New password:', newPassword);
}

main().catch(console.error).finally(() => prisma.$disconnect());
