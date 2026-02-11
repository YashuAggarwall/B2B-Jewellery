import mongoose from 'mongoose';
import dotenv from 'dotenv';
import InventoryItem from './models/InventoryItem.js';
import connectDB from './config/db.js';

dotenv.config();

// Sample inventory items with real jewellery data
const sampleInventory = [
    {
        sku: 'RING-GLD-001',
        name: 'Classic Gold Diamond Ring',
        description: 'Elegant 18K gold ring with solitaire diamond, perfect for engagements',
        category: 'Ring',
        material: {
            metal: 'Gold',
            purity: '18K',
            weight: 3.5,
            gemstones: [
                {
                    type: 'Diamond',
                    carat: 0.5,
                    clarity: 'VS1',
                    color: 'F'
                }
            ]
        },
        specifications: {
            size: '16',
            shape: 'Round',
            style: 'Solitaire',
            finish: 'Polished'
        },
        images: [
            'https://images.unsplash.com/photo-1605100804763-247f8c4d5b3e?w=400&h=400&fit=crop&q=80'
        ],
        baseCost: 25000,
        stockQuantity: 5,
        minOrderQuantity: 1,
        isAvailable: true,
        supplier: {
            name: 'Internal Inventory',
            location: 'Mumbai'
        }
    },
    {
        sku: 'RING-GLD-002',
        name: 'Twisted Gold Band Ring',
        description: 'Modern twisted design 22K gold ring with intricate detailing',
        category: 'Ring',
        material: {
            metal: 'Gold',
            purity: '22K',
            weight: 4.2,
            gemstones: []
        },
        specifications: {
            size: '18',
            shape: 'Oval',
            style: 'Band',
            finish: 'Matte'
        },
        images: [
            'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&h=400&fit=crop&q=80'
        ],
        baseCost: 18000,
        stockQuantity: 8,
        minOrderQuantity: 1,
        isAvailable: true,
        supplier: {
            name: 'Internal Inventory',
            location: 'Delhi'
        }
    },
    {
        sku: 'NECK-GLD-001',
        name: 'Gold Chain Necklace',
        description: 'Traditional 22K gold chain necklace with delicate links',
        category: 'Necklace',
        material: {
            metal: 'Gold',
            purity: '22K',
            weight: 15.5,
            gemstones: []
        },
        specifications: {
            length: '18 inches',
            shape: 'Chain',
            style: 'Traditional',
            finish: 'Polished'
        },
        images: [
            'https://images.unsplash.com/photo-1599643478518-a784697e3f8c?w=400&h=400&fit=crop&q=80'
        ],
        baseCost: 65000,
        stockQuantity: 3,
        minOrderQuantity: 1,
        isAvailable: true,
        supplier: {
            name: 'Internal Inventory',
            location: 'Jaipur'
        }
    },
    {
        sku: 'NECK-PRL-001',
        name: 'Pearl String Necklace',
        description: 'Elegant freshwater pearl necklace with gold clasp',
        category: 'Necklace',
        material: {
            metal: 'Gold',
            purity: '18K',
            weight: 2.0,
            gemstones: [
                {
                    type: 'Pearl',
                    carat: 0,
                    clarity: 'AAA',
                    color: 'White'
                }
            ]
        },
        specifications: {
            length: '16 inches',
            shape: 'Round',
            style: 'Classic',
            finish: 'Polished'
        },
        images: [
            'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&h=400&fit=crop&q=80'
        ],
        baseCost: 35000,
        stockQuantity: 6,
        minOrderQuantity: 1,
        isAvailable: true,
        supplier: {
            name: 'Internal Inventory',
            location: 'Hyderabad'
        }
    },
    {
        sku: 'EAR-GLD-001',
        name: 'Gold Drop Earrings',
        description: 'Stunning 18K gold drop earrings with small diamonds',
        category: 'Earring',
        material: {
            metal: 'Gold',
            purity: '18K',
            weight: 5.0,
            gemstones: [
                {
                    type: 'Diamond',
                    carat: 0.3,
                    clarity: 'VS2',
                    color: 'G'
                }
            ]
        },
        specifications: {
            size: 'Medium',
            shape: 'Drop',
            style: 'Contemporary',
            finish: 'Polished'
        },
        images: [
            'https://images.unsplash.com/photo-1535632066927-3c3a4e0a0e7b?w=400&h=400&fit=crop&q=80'
        ],
        baseCost: 28000,
        stockQuantity: 4,
        minOrderQuantity: 1,
        isAvailable: true,
        supplier: {
            name: 'Internal Inventory',
            location: 'Mumbai'
        }
    },
    {
        sku: 'BRAC-GLD-001',
        name: 'Gold Link Bracelet',
        description: 'Classic 22K gold link bracelet with secure clasp',
        category: 'Bracelet',
        material: {
            metal: 'Gold',
            purity: '22K',
            weight: 12.0,
            gemstones: []
        },
        specifications: {
            length: '7.5 inches',
            shape: 'Link',
            style: 'Classic',
            finish: 'Polished'
        },
        images: [
            'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop&q=80'
        ],
        baseCost: 48000,
        stockQuantity: 5,
        minOrderQuantity: 1,
        isAvailable: true,
        supplier: {
            name: 'Internal Inventory',
            location: 'Surat'
        }
    }
];

async function seedInventory() {
    try {
        await connectDB();

        console.log('🗑️  Clearing existing inventory...');
        await InventoryItem.deleteMany({});

        console.log('📦 Adding sample inventory items...\n');

        for (const item of sampleInventory) {
            const created = await InventoryItem.create(item);
            console.log(`✅ Added: ${created.name} (${created.sku})`);
            console.log(`   Category: ${created.category}`);
            console.log(`   Price: ₹${created.baseCost.toLocaleString()}`);
            console.log(`   Stock: ${created.stockQuantity} units\n`);
        }

        console.log(`\n✨ Successfully added ${sampleInventory.length} items to inventory!`);
        console.log('\n📊 Inventory Summary:');
        console.log(`   Rings: ${sampleInventory.filter(i => i.category === 'Ring').length}`);
        console.log(`   Necklaces: ${sampleInventory.filter(i => i.category === 'Necklace').length}`);
        console.log(`   Earrings: ${sampleInventory.filter(i => i.category === 'Earrings').length}`);
        console.log(`   Bracelets: ${sampleInventory.filter(i => i.category === 'Bracelet').length}`);

        console.log('\n🎯 Now when users upload images:');
        console.log('   1. System will check this inventory FIRST');
        console.log('   2. If category matches, these items will be recommended');
        console.log('   3. Real images and prices will be shown');
        console.log('   4. Different uploads = different recommendations\n');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding inventory:', error);
        process.exit(1);
    }
}

seedInventory();
