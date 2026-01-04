// Simple API Test using native fetch (Node 18+)

const BASE_URL = 'http://127.0.0.1:3000';

async function testAPI() {
    console.log("\n🧪 Testing API Endpoints...\n");
    
    // Test 1: GET /locations
    try {
        console.log("1️⃣ Testing GET /locations");
        const res = await fetch(`${BASE_URL}/locations`);
        console.log(`   Status: ${res.status} ${res.statusText}`);
        
        if (res.ok) {
            const data = await res.json();
            console.log(`   ✅ Success! Received ${Array.isArray(data) ? data.length : 'non-array'} items`);
            if (Array.isArray(data) && data.length > 0) {
                console.log(`   Sample data:`, JSON.stringify(data[0], null, 2));
            }
        } else {
            const text = await res.text();
            console.log(`   ❌ Failed:`, text);
        }
    } catch (err) {
        console.error(`   ❌ Error:`, err.message);
    }
    
    // Test 2: GET /products
    try {
        console.log("\n2️⃣ Testing GET /products");
        const res = await fetch(`${BASE_URL}/products`);
        console.log(`   Status: ${res.status} ${res.statusText}`);
        
        if (res.ok) {
            const data = await res.json();
            console.log(`   ✅ Success! Received ${Array.isArray(data) ? data.length : 'non-array'} items`);
            if (Array.isArray(data) && data.length > 0) {
                console.log(`   Sample data:`, JSON.stringify(data[0], null, 2));
            }
        } else {
            const text = await res.text();
            console.log(`   ❌ Failed:`, text);
        }
    } catch (err) {
        console.error(`   ❌ Error:`, err.message);
    }
    
    console.log("\n✅ Test Complete\n");
}

testAPI();
