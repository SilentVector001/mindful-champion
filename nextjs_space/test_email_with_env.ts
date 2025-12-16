const testEmail = async () => {
  const apiKey = process.env.RESEND_API_KEY;
  console.log('API Key present:', !!apiKey);
  console.log('API Key starts with:', apiKey?.substring(0, 10));
  
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: 'Mindful Champion <noreply@mindfulchampion.com>',
      to: ['deansnow59@gmail.com'],
      subject: 'Test Email - Domain Verified!',
      html: '<h1>🎉 Success!</h1><p>Your mindfulchampion.com domain is now verified in Resend and emails are working!</p>'
    })
  });
  
  const data = await response.json();
  console.log('Response:', JSON.stringify(data, null, 2));
};

testEmail();
