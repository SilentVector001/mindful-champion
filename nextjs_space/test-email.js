const { Resend } = require('resend');

const resend = new Resend('re_MF3dtRpT_ENzbTRqTxGSruvwBPzwzp4Qs');

async function testEmail() {
  try {
    console.log('Testing email with Dean@mindfulchampion.com...');
    const result = await resend.emails.send({
      from: 'Dean@mindfulchampion.com',
      to: 'test@example.com',
      subject: 'Test Email - Mindful Champion',
      html: '<p>This is a test email from Mindful Champion</p>',
    });
    
    console.log('SUCCESS:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('ERROR:', error.message);
    if (error.response) {
      console.log('Response:', JSON.stringify(error.response, null, 2));
    }
  }
}

testEmail();
