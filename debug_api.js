require('dotenv').config({ path: 'server/.env' });
const axios = require('axios');

async function test() {
    try {
        const url = 'http://cosylab.iiitd.edu.in:6969/recipe2-api/recipeofday';
        console.log('Fetching:', url);
        const res = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${process.env.RECIPEDB_KEY}` }
        });

        console.log('Status:', res.status);
        console.log('Type of data:', typeof res.data);
        console.log('Data keys:', Object.keys(res.data));

        if (res.data.payload) {
            console.log('Payload keys:', Object.keys(res.data.payload));
            if (res.data.payload.data) {
                console.log('Payload.data is array?', Array.isArray(res.data.payload.data));
                if (Array.isArray(res.data.payload.data) && res.data.payload.data.length > 0) {
                    console.log('First item keys:', Object.keys(res.data.payload.data[0]));
                    console.log('First item sample:', JSON.stringify(res.data.payload.data[0], null, 2));
                }
            }
        } else {
            console.log('Data sample:', JSON.stringify(res.data, null, 2));
        }

    } catch (err) {
        console.error('Error:', err.message);
        if (err.response) {
            console.error('Data:', err.response.data);
        }
    }
}

test();
