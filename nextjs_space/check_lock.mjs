import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkLock() {
  try {
    const user = await prisma.user.findFirst({
      where: { 
        email: {
          equals: 'deansnow59@gmail.com',
          mode: 'insensitive'
        }
      }
    });
    
    if (!user) {
      console.log('User not found');
      return;
    }
    
    console.log('Checking account lock status...');
    console.log('User ID:', user.id);
    console.log('Failed login attempts:', user.failedLoginAttempts || 0);
    console.log('Account locked until:', user.accountLockedUntil || 'Not locked');
    console.log('Last failed login:', user.lastFailedLogin || 'Never');
    
    // Check if locked
    const now = new Date();
    const isLocked = user.accountLockedUntil && new Date(user.accountLockedUntil) > now;
    console.log('Is account currently locked?', isLocked ? 'YES ⚠️' : 'NO ✓');
    
    if (isLocked) {
      const unlockTime = new Date(user.accountLockedUntil);
      console.log('Account will unlock at:', unlockTime.toISOString());
      console.log('Time remaining:', Math.ceil((unlockTime - now) / 1000 / 60), 'minutes');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkLock();
