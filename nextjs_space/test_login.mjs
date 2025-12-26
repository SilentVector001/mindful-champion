async function testLogin() {
  const loginData = {
    email: 'Deansnow59@gmail.com', // Testing with capital D
    password: 'AdminChampion2024!',
    redirect: false
  };
  
  console.log('Testing login with:', loginData.email);
  
  try {
    const response = await fetch('http://localhost:3012/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: loginData.email,
        password: loginData.password,
        redirect: 'false',
        json: 'true'
      }).toString()
    });
    
    const text = await response.text();
    console.log('\nResponse status:', response.status);
    console.log('Response body:', text);
    
    // Now let's also test the SignIn endpoint
    console.log('\n--- Testing NextAuth SignIn endpoint ---');
    const signinResponse = await fetch('http://localhost:3012/api/auth/signin/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: loginData.email,
        password: loginData.password,
        callbackUrl: '/dashboard'
      })
    });
    
    console.log('SignIn response status:', signinResponse.status);
    console.log('SignIn response:', await signinResponse.text());
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLogin();
