// Test login endpoint
async function testLogin() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'citizen@test.com',
        password: 'citizen123'
      }),
    });

    const data = await response.json();
    console.log('Login Response:', data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Login Error:', error.message);
  }
}

testLogin();
