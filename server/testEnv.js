// Quick test to verify RapidAPI key is loaded
import dotenv from 'dotenv';
dotenv.config();

console.log('=== Environment Variables Test ===');
console.log('RAPIDAPI_KEY:', process.env.RAPIDAPI_KEY ? '✅ Loaded' : '❌ Not Found');
console.log('RAPIDAPI_HOST:', process.env.RAPIDAPI_HOST || 'Not set');
console.log('Key length:', process.env.RAPIDAPI_KEY?.length || 0);
console.log('First 10 chars:', process.env.RAPIDAPI_KEY?.substring(0, 10) || 'N/A');
