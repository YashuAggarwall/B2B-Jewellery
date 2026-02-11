import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';
const EMAIL = 'admin@jewellery.com';
const PASSWORD = 'admin123';

async function run() {
    try {
        console.log('🔑 Logging in...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD
        });
        const token = loginRes.data.token;
        console.log('✅ Login successful.');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        // Simulated external item
        const extItem = {
            recommendationId: `ext-${Date.now()}-1234`,
            quantity: 1,
            productDetails: {
                recommendationId: `ext-${Date.now()}-1234`,
                sourceType: 'External',
                name: 'Test External Ring',
                priceRange: { min: 10000, max: 20000, currency: 'INR' },
                images: ['https://example.com/image.jpg'],
                category: 'Ring'
            }
        };

        console.log('\n🛒 Attempting to add external item WITH productDetails...');
        try {
            const addRes = await axios.post(`${BASE_URL}/cart/items`, extItem, config);
            console.log('✅ Success! Item added:', addRes.data.message);
        } catch (err) {
            console.error('❌ Failed:', err.response?.data || err.message);
        }

        console.log('\n🛒 Attempting to add external item WITHOUT productDetails (expect failure)...');
        try {
            const failItem = { ...extItem, recommendationId: `ext-${Date.now()}-9999` };
            delete failItem.productDetails;

            await axios.post(`${BASE_URL}/cart/items`, failItem, config);
            console.log('❓ Unexpected Success! (Should have failed)');
        } catch (err) {
            console.log('✅ Failed as expected:', err.response?.data || err.message);
        }

    } catch (error) {
        console.error('❌ Script Error:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 usage: Ensure server is running on localhost:5000');
        }
    }
}

run();
