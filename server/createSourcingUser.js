import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import connectDB from './config/db.js';

dotenv.config();

/**
 * Create Sourcing User Script
 */

async function createSourcingUser() {
    try {
        await connectDB();

        const sourcingData = {
            name: 'Sourcing User',
            email: 'sourcing@jewellery.com',
            password: 'sourcing123',
            role: 'Sourcing',
            company: 'Jewellery Platform',
            isActive: true,
        };

        const existingUser = await User.findOne({ email: sourcingData.email });

        if (existingUser) {
            console.log('❌ User already exists!');
            if (existingUser.role !== 'Sourcing') {
                existingUser.role = 'Sourcing';
                await existingUser.save();
                console.log('✅ Updated existing user to Sourcing role!');
            }
        } else {
            const user = await User.create(sourcingData);
            console.log('\n✅ Sourcing user created successfully!\n');
            console.log('📧 Email:', user.email);
            console.log('🔑 Password:', sourcingData.password);
            console.log('👤 Role:', user.role);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

createSourcingUser();
