#!/usr/bin/env node

/**
 * Secret Generator Script
 * 
 * This script generates cryptographically secure random secrets for use in environment variables.
 * Run with: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

function generateSecret(bytes = 32, format = 'hex') {
  return crypto.randomBytes(bytes).toString(format);
}

function generateJwtSecret() {
  return {
    accessToken: generateSecret(32, 'hex'),
    refreshToken: generateSecret(32, 'hex'),
  };
}

function generateDatabasePassword() {
  // Generate a strong password with mixed characters
  const length = 32;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += charset[randomBytes[i] % charset.length];
  }
  
  return password;
}

function generateApiKey() {
  return {
    openai: `sk-${generateSecret(48, 'hex')}`,
    custom: generateSecret(32, 'hex'),
  };
}

function generateMongoDbSecret() {
  return {
    password: generateDatabasePassword(),
    connectionString: `mongodb+srv://user:${generateDatabasePassword()}@cluster.mongodb.net/db`,
  };
}

console.log('=== Secure Secrets Generator ===\n');

console.log('JWT Secrets (for .env files):');
const jwtSecrets = generateJwtSecret();
console.log(`JWT_ACCESS_SECRET=${jwtSecrets.accessToken}`);
console.log(`JWT_REFRESH_SECRET=${jwtSecrets.refreshToken}`);

console.log('\nDatabase Password (for MongoDB Atlas):');
const dbSecret = generateDatabasePassword();
console.log(`DB_PASSWORD=${dbSecret}`);

console.log('\nAPI Keys (for external services):');
const apiKeys = generateApiKey();
console.log(`OPENAI_API_KEY=${apiKeys.openai}`);
console.log(`CUSTOM_API_KEY=${apiKeys.custom}`);

console.log('\n=== Security Notes ===');
console.log('1. Store these secrets securely in environment variables');
console.log('2. Never commit secrets to version control');
console.log('3. Use different secrets for development and production');
console.log('4. Rotate secrets regularly (recommended: every 90 days)');
console.log('5. Use a secrets manager for production (AWS Secrets Manager, HashiCorp Vault, etc.)');

console.log('\n=== MongoDB Atlas Connection String Example ===');
const mongoSecret = generateMongoDbSecret();
console.log(`MONGODB_URI=mongodb+srv://username:${mongoSecret.password}@cluster0.xxxxx.mongodb.net/ai-interview-coach?retryWrites=true&w=majority&ssl=true`);