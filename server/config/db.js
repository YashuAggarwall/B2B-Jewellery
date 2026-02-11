import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Check if MongoDB URI is defined
        if (!process.env.MONGODB_URI) {
            console.error('\n❌ ERROR: MONGODB_URI is not defined in .env file');
            console.error('Please add MONGODB_URI to your .env file');
            console.error('Example: MONGODB_URI=mongodb://localhost:27017/jewellery-sourcing\n');
            process.exit(1);
        }

        console.log('🔄 Connecting to MongoDB...');
        console.log(`📍 Connection URI: ${process.env.MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);

        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`✅ MongoDB Connected Successfully!`);
        console.log(`📊 Database: ${conn.connection.name}`);
        console.log(`🌐 Host: ${conn.connection.host}`);
        console.log(`🔌 Port: ${conn.connection.port}\n`);
    } catch (error) {
        console.error('\n❌ MongoDB Connection Error:');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        if (error.message.includes('bad auth')) {
            console.error('🔐 Authentication Failed');
            console.error('   → Check your username and password in MONGODB_URI');
            console.error('   → Ensure the database user exists in MongoDB Atlas');
            console.error('   → Verify the password is correct (no special characters issues)');
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
            console.error('🌐 Cannot Reach MongoDB Server');
            console.error('   → Check if MongoDB is running (local)');
            console.error('   → Verify the connection string is correct');
            console.error('   → Check your internet connection (Atlas)');
            console.error('   → Ensure IP whitelist is configured (Atlas)');
        } else if (error.message.includes('MongoServerSelectionError')) {
            console.error('⏱️  Server Selection Timeout');
            console.error('   → MongoDB server is not responding');
            console.error('   → Check if MongoDB service is running');
            console.error('   → Verify network connectivity');
        } else {
            console.error('📋 Error Details:');
            console.error(`   ${error.message}`);
        }

        console.error('\n💡 Quick Fixes:');
        console.error('   1. For Local MongoDB: Ensure MongoDB is installed and running');
        console.error('   2. For MongoDB Atlas:');
        console.error('      - Create a cluster at https://www.mongodb.com/cloud/atlas');
        console.error('      - Add your IP to Network Access (or allow 0.0.0.0/0 for testing)');
        console.error('      - Create a database user with password');
        console.error('      - Update MONGODB_URI in .env file');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        process.exit(1);
    }
};

export default connectDB;
