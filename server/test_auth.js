const axios = require('axios');

const testAuth = async () => {
    const url = 'http://localhost:5000/api/auth';
    const testUser = {
        username: 'testuser_' + Date.now(),
        email: 'test_' + Date.now() + '@example.com',
        password: 'password123'
    };

    try {
        console.log('1. Testing Registration...');
        const regRes = await axios.post(`${url}/register`, testUser);
        console.log('Registration Success! Token received:', regRes.data.token ? 'Yes' : 'No');

        console.log('2. Testing Login...');
        const loginRes = await axios.post(`${url}/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log('Login Success! Token received:', loginRes.data.token ? 'Yes' : 'No');
        console.log('User Role:', loginRes.data.user.role);

    } catch (err) {
        console.error('Test Failed:', err.response ? err.response.data : err.message);
    }
};

testAuth();
