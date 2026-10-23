// Test backend API
async function testBackend() {
  try {
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    console.log('Backend Health Check:', data);
  } catch (error) {
    console.error('Backend Error:', error.message);
  }
}

testBackend();
