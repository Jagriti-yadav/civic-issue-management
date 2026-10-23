// Test registration endpoint
async function testRegister() {
  try {
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'newuser@test.com',
        password: 'test123'
      }),
    });

    const data = await response.json();
    console.log('Registration Response:', data);
    console.log('Status:', response.status);
  } catch (error) {
    console.error('Registration Error:', error.message);
  }
}

testRegister();
