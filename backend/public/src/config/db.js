import mongoose from "mongoose";
import { env } from "./env.js";
import { dbSecurityOptions, implementDatabaseSecurity } from "./db-security.js";
export async function connectDatabase() {
    // Implement security configurations
    implementDatabaseSecurity();
    // Connect with security options
    await mongoose.connect(env.MONGODB_URI, dbSecurityOptions);
    // Connection event handlers for monitoring
    mongoose.connection.on('connected', () => {
        console.log('MongoDB connected successfully with security settings');
    });
    mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error);
    });
    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected');
    });
    // Handle process termination
    process.on('SIGINT', async () => {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    });
}
