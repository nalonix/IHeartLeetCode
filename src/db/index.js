
// const { Redis } = require('@upstash/redis');
import { Redis } from '@upstash/redis';

// const dotenv = require('dotenv');
import dotenv from 'dotenv';
dotenv.config();

export const redis = new Redis({
  url: process.env.UPSTASH_URL,
  token: process.env.UPSTASH_TOKEN,
})


