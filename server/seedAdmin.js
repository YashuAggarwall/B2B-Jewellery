import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SystemSettings from './models/SystemSettings.js';
import EmailTemplate from './models/EmailTemplate.js';

dotenv.config();

const seedSystem = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        const settings = [
            { key: 'platform_name', value: 'B2B Jewellery', description: 'Name of the sourcing platform', category: 'General' },
            { key: 'currency', value: 'INR', description: 'Primary currency for pricing', category: 'Pricing' },
            { key: 'support_email', value: 'support@b2bjewellery.com', description: 'Contact email for support', category: 'Communication' },
            { key: 'quotation_validity_days', value: 30, description: 'Default validity period for quotations', category: 'Pricing' },
            { key: 'maintenance_mode', value: false, description: 'Disable platform for maintenance', category: 'General' },
        ];

        const templates = [
            {
                name: 'Quotation Sent',
                subject: 'New Quotation Received: {{quotationNumber}}',
                body: '<h1>Hello {{customerName}},</h1><p>Your quotation for {{itemCount}} items has been generated.</p><p>Total Amount: {{totalAmount}}</p><p>Please login to your dashboard to review and approve.</p>',
                placeholders: ['quotationNumber', 'customerName', 'itemCount', 'totalAmount'],
                description: 'Sent to customers when a sales user sends a quotation'
            },
            {
                name: 'Cart Submitted',
                subject: 'New Sourcing Request Submitted: {{cartId}}',
                body: '<h1>New Request,</h1><p>A new sourcing request has been submitted by {{customerName}}.</p><p>Please review the items and provide recommendations.</p>',
                placeholders: ['cartId', 'customerName'],
                description: 'Sent to sales team when a customer submits a cart'
            }
        ];

        // Seed Settings
        for (const s of settings) {
            await SystemSettings.findOneAndUpdate({ key: s.key }, s, { upsert: true, new: true });
        }
        console.log('System settings seeded.');

        // Seed Templates
        for (const t of templates) {
            await EmailTemplate.findOneAndUpdate({ name: t.name }, t, { upsert: true, new: true });
        }
        console.log('Email templates seeded.');

        await mongoose.disconnect();
        console.log('Seeding complete.');
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedSystem();
