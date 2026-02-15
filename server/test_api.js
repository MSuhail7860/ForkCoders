const axios = require('axios');

const BASE_URL = 'https://cosylab.iiitd.edu.in/recipe-db/api';

async function testApi() {
    console.log(`\n--- Probing ${BASE_URL}/recipes?page=1&limit=1 ---`);
    try {
        const res = await axios.get(`${BASE_URL}/recipes?page=1&limit=1`, { timeout: 10000 });
        console.log('✅ SUCCESS! Status:', res.status);
        console.log('✅ Keys found:', Object.keys(res.data));
    } catch (err) {
        console.log(`❌ Failed:`, err.message);
    }
}

testApi();