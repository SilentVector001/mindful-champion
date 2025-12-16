import { prisma } from './lib/db';

async function checkTrainingPrograms() {
  try {
    const programs = await prisma.trainingProgram.findMany({
      orderBy: { name: 'asc' }
    });
    
    console.log(`\n📊 Total Training Programs: ${programs.length}\n`);
    
    if (programs.length === 0) {
      console.log('⚠️  No training programs found in database!');
      console.log('   The training page will appear blank.');
    } else {
      programs.forEach((program, index) => {
        console.log(`${index + 1}. ${program.name}`);
        console.log(`   ID: ${program.id}`);
        console.log(`   Program ID: ${program.programId}`);
        console.log(`   Level: ${program.skillLevel}`);
        console.log(`   Duration: ${program.durationDays} days`);
        console.log(`   Active: ${program.isActive}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTrainingPrograms();
