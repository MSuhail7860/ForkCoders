require('dotenv').config();
const axios = require('axios');

async function probe(path) {
    const url = `http://cosylab.iiitd.edu.in:6969${path}`;
    console.log(`\n--- Probing ${url} ---`);
    try {
        const res = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${process.env.RECIPEDB_KEY}` },
            timeout: 5000
        });
        console.log(`Status: ${res.status}`);
        console.log('Success! Data type:', typeof res.data);
        // console.log(JSON.stringify(res.data).substring(0, 200));
    } catch (err) {
        if (err.response) {
            console.log(`Failed: ${err.response.status} - ${err.response.statusText}`);
            // console.log('Error Data:', JSON.stringify(err.response.data).substring(0, 200));
        } else {
            console.log(`Error: ${err.message}`);
        }
    }
}

async function run() {
    await probe('/recipe2-api/recipeofday');
    await probe('/recipe2-api/recipe-of-day'); // Try hyphen
    await probe('/api/recipeofday');
    await probe('/recipeofday');
    await probe('/recipes/recipeofday');

    // Try other known endpoints to see if *any* work
    await probe('/recipe2-api/protein-range?min=20&max=100');
    await probe('/recipe2-api/nutritioninfo/123'); // Assuming IDs are numeric
}

run();
