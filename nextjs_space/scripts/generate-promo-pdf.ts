import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function generatePromoPDF() {
  console.log('📋 Generating Promo Code PDF...\n');

  // Fetch all promo codes
  const promoCodes = await prisma.promoCode.findMany({
    orderBy: { code: 'asc' },
    select: {
      code: true,
      assignedTo: true,
      status: true,
      durationDays: true,
      rewardAmount: true,
    }
  });

  console.log(`Found ${promoCodes.length} promo codes\n`);

  // Separate by assignment
  const leeCodes = promoCodes.filter(c => c.assignedTo === 'Lee');
  const ownerCodes = promoCodes.filter(c => c.assignedTo === 'Owner');

  // Create PDF for Lee
  await createPDF(leeCodes, 'Lee', '/home/ubuntu/mindful_champion/LEE_PROMO_CODES.pdf');
  
  // Create PDF for Owner
  await createPDF(ownerCodes, 'Owner', '/home/ubuntu/mindful_champion/OWNER_PROMO_CODES.pdf');

  console.log('\n✅ PDF generation complete!');
  console.log(`   📄 Lee's PDF: /home/ubuntu/mindful_champion/LEE_PROMO_CODES.pdf`);
  console.log(`   📄 Owner's PDF: /home/ubuntu/mindful_champion/OWNER_PROMO_CODES.pdf\n`);
}

async function createPDF(codes: any[], assignedTo: string, filePath: string) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      size: 'LETTER',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });
    
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Header
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fillColor('#00D084')
       .text('MINDFUL CHAMPION', { align: 'center' });
    
    doc.fontSize(16)
       .fillColor('#333333')
       .text('Beta Tester Promo Codes', { align: 'center' });
    
    doc.moveDown(0.5);
    
    doc.fontSize(12)
       .font('Helvetica')
       .fillColor('#666666')
       .text(`Assigned to: ${assignedTo}`, { align: 'center' });
    
    doc.moveDown(1);
    
    // Instructions box
    doc.fontSize(10)
       .fillColor('#444444')
       .rect(50, doc.y, 512, 80)
       .stroke();
    
    doc.moveDown(0.5);
    doc.text('INSTRUCTIONS:', 60, doc.y, { underline: true, continued: false });
    doc.moveDown(0.3);
    doc.text('1. Give each code to one person only', 60);
    doc.text('2. Write their name in the "Given To" box', 60);
    doc.text('3. Check the box and write the date when you distribute it', 60);
    doc.text('4. Each code provides: 30 Days PRO Access + $25 Amazon Gift Card (after tasks)', 60);
    
    doc.moveDown(2);

    // Table header
    const startY = doc.y;
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor('#000000');
    
    doc.rect(50, startY, 512, 25)
       .fillAndStroke('#00D084', '#000000');
    
    doc.fillColor('#FFFFFF')
       .text('#', 60, startY + 8, { width: 30 })
       .text('PROMO CODE', 100, startY + 8, { width: 150 })
       .text('GIVEN TO (Name)', 260, startY + 8, { width: 150 })
       .text('✓', 420, startY + 8, { width: 30 })
       .text('DATE', 460, startY + 8, { width: 80 });

    doc.moveDown(1.5);

    // Promo codes with tracking boxes
    let currentY = doc.y;
    const rowHeight = 35;
    let rowNumber = 1;

    codes.forEach((code, index) => {
      // Check if we need a new page
      if (currentY + rowHeight > 700) {
        doc.addPage();
        currentY = 50;
      }

      const isEven = index % 2 === 0;
      
      // Alternating row background
      if (isEven) {
        doc.rect(50, currentY, 512, rowHeight)
           .fill('#F5F5F5');
      }

      doc.fillColor('#000000')
         .font('Helvetica')
         .fontSize(9);

      // Row number
      doc.text(`${rowNumber}`, 60, currentY + 10, { width: 30 });
      
      // Promo code
      doc.font('Helvetica-Bold')
         .fontSize(10)
         .text(code.code, 100, currentY + 10, { width: 150 });
      
      // "Given To" box
      doc.rect(260, currentY + 5, 150, 25)
         .stroke('#CCCCCC');
      
      // Checkbox
      doc.rect(425, currentY + 8, 18, 18)
         .stroke('#000000');
      
      // Date box
      doc.rect(460, currentY + 5, 80, 25)
         .stroke('#CCCCCC');

      currentY += rowHeight;
      rowNumber++;
    });

    // Footer
    doc.fontSize(8)
       .fillColor('#999999')
       .text(
         'Redemption URL: https://mindful-champion-2hzb4j.abacusai.app/beta',
         50,
         750,
         { align: 'center', width: 512 }
       );

    doc.end();

    stream.on('finish', () => {
      console.log(`✅ Generated: ${filePath}`);
      resolve(true);
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

generatePromoPDF()
  .catch((e) => {
    console.error('❌ Error generating PDF:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
