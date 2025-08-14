import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const testConnection = async () => {
    try {
        console.log('🔍 Testing database connection...');
        console.log('MongoDB URI:', process.env.MONGODB_URI || 'Not set');

        if (!process.env.MONGODB_URI) {
            console.error('❌ MONGODB_URI is not set in environment variables');
            console.log('Please create a .env file with MONGODB_URI=mongodb://localhost:27017/cockpit_management');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Database connected successfully!');

        // Test if we can access the database
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📊 Available collections:', collections.map(c => c.name));

        await mongoose.disconnect();
        console.log('✅ Database connection test completed successfully!');

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('\nPossible solutions:');
        console.log('1. Make sure MongoDB is running');
        console.log('2. Check your MONGODB_URI in .env file');
        console.log('3. If using MongoDB Atlas, check your connection string');
        process.exit(1);
    }
};

testConnection();
