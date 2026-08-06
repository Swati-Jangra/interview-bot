import { createApp } from '../backend/src/app.js';
import { connectDatabase } from '../backend/src/config/db.js';
import { env } from '../backend/src/config/env.js';

const app = createApp();

// Connect to database for each invocation
let isConnected = false;

export default async function handler(req: any, res: any) {
  if (!isConnected) {
    await connectDatabase();
    isConnected = true;
  }
  
  return app(req, res);
}