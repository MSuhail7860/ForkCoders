const axios = require('axios');

// Using the PRODUCTION HTTPS URL instead of port 6969
const BASE_URL = 'https://cosylab.iiitd.edu.in/recipe-db/api';

async function probeUrl(endpoint) {
    const url = `${BASE_URL}${endpoint}`;
    console.log(`\n--- Probing ${url} ---`);
    try {
        const res = await axios.get(url, { timeout: 10000 });
        console.log('✅ SUCCESS: Status', res.status);
        
        // Print the top-level keys to understand the structure
        console.log('Data keys:', Object.keys(res.data));
        
        // Print a snippet of the actual data
        if (res.data.recipes && Array.isArray(res.data.recipes)) {
            console.log(`Found ${res.data.recipes.length} recipes in 'recipes' array.`);
            if (res.data.recipes.length > 0) {
                 console.log('Sample title:', res.data.recipes[0].Recipe_title || res.data.recipes[0].recipe_title || 'No title field found');
                 console.log('Sample Image:', res.data.recipes[0].img_url || 'No image field found');
            }
        } else {
             console.log('Data sample:', JSON.stringify(res.data).substring(0, 150) + '...');
        }

    } catch (err) {
        if (err.response) {
            console.log(`❌ Failed: ${err.response.status} - ${err.response.statusText}`);
        } else {
            console.log(`❌ Failed: ${err.message}`);
        }
    }
}

async function runTests() {
    // 1. The original known working route
    await probeUrl('/recipes?page=1&limit=1');
    
    // 2. Testing variations for "Recipe of the Day"
    await probeUrl('/recipeofday');
    await probeUrl('/recipes/recipeofday');
    
    // 3. Testing nutrient search 
    await probeUrl('/recipes?protein_min=20&protein_max=100&limit=5');
    await probeUrl('/recipes?carbs_max=15&limit=5');
}

runTests();