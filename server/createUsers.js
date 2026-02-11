// Test script to create initial users for the application
// Run this with: node createUsers.js

import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const users = [
    {
        name: 'External User Demo',
        email: 'external@demo.com',
        password: 'password123',
        company: 'ABC Jewellers',
        phone: '+91-9876543210',
    },
    {
        name: 'Sales User Demo',
        email: 'sales@demo.com',
        password: 'password123',
        company: 'Internal',
        phone: '+91-9876543211',
    },
    {
        name: 'Sourcing User Demo',
        email: 'sourcing@demo.com',
        password: 'password123',
        company: 'Internal',
        phone: '+91-9876543212',
    },
    {
        name: 'Admin User Demo',
        email: 'admin@demo.com',
        password: 'password123',
        company: 'Internal',
        phone: '+91-9876543213',
    },
];

async function createUsers() {
    console.log('🚀 Creating demo users...\n');

    for (const user of users) {
        try {
            const response = await axios.post(`${API_URL}/auth/register`, user);
            console.log(`✅ Created: ${user.email}`);
            console.log(`   Role: ${response.data.data.user.role}`);
            console.log(`   Token: ${response.data.data.token.substring(0, 20)}...\n`);
        } catch (error) {
            if (error.response?.data?.message?.includes('already exists')) {
                console.log(`ℹ️  User already exists: ${user.email}\n`);
            } else {
                console.log(`❌ Failed to create ${user.email}`);
                console.log(`   Error: ${error.response?.data?.message || error.message}\n`);
            }
        }
    }

    console.log('✨ Done! You can now login with:');
    console.log('   External: external@demo.com / password123');
    console.log('   Sales: sales@demo.com / password123');
    console.log('   Sourcing: sourcing@demo.com / password123');
    console.log('   Admin: admin@demo.com / password123');
    console.log('\n🌐 Open http://localhost:3000 to login!');
}

createUsers();
