import { redis } from './db/index.js';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';

import { botApi, dateToUnixEpoch, hoursDifference } from './utils/index.js';
import { punishments } from './punishments/index.js';

import dotenv from 'dotenv';
dotenv.config();

const app = new Hono();

const channelID = process.env.CHANNEL_ID || '';
const leetCodeUsername = process.env.LEETCODE_USERNAME || '';

// Middleware to validate API key
app.use('/punishments/images/*', async (c, next) => {
  const apiKey = c.req.query('apiKey');
  console.log('the api key: ', apiKey);

  if (!apiKey || (apiKey !== process.env.INSTANCE_SECRET)) {
    return c.text('Forbidden', 403);
  }
  await next();
});

// Serve static images
app.use('/punishments/images/*', serveStatic({ root: './src' }));

// Use middleware to validate the user
app.use('/', async (c, next) => {
  const apiKey = c.req.query('apiKey');
  console.log('the api key: ', apiKey);

  if (!apiKey || (apiKey !== process.env.INSTANCE_SECRET)) {
    return c.text('Forbidden', 403);
  }
  await next();
});

app.get('/', async (c) => {
  const date = new Date(); 
  const unixEpochTime = dateToUnixEpoch(date);
  const missedCount = await redis.get('missedCount') || 1;

  const resp = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${leetCodeUsername}`);

  if (!resp.ok) {
    return c.json({ success: false, message: "Failed to fetch from leetcode API" });
  }
  const body = await resp.json();

  const lastPractice = body.recentSubmissions[0].timestamp;
  const diffHours = hoursDifference(unixEpochTime, lastPractice);  

  let response;

  // If not greater than 24 hours, appreciate the user
  if (diffHours <= 24) {
    response = await botApi.sendMessage(`You have submitted today, keep it up! 🎉`, channelID);
    if (response.ok) {
      return c.json({ success: true, difference: diffHours.toString() });
    }
    return c.json({ success: false, message: "Failed to send message" });
  }

  // If greater than 24 hours, punish the user
  if (diffHours > 24) {
    const punishment = punishments[missedCount.toString()];

    if (punishment.type === 'text') {
      response = await botApi.sendMessage(punishment.data, channelID);
    } else if (punishment.type === 'photo') {
      response = await botApi.sendPhoto(`${c.req.url}/punishments/images/${punishment.data}?apiKey=${process.env.INSTANCE_SECRET}`, channelID);
      return c.json(response);
    }

    if (response.ok) {
      await redis.set('missedCount', missedCount + 1);
      return c.json({ success: true, difference: diffHours.toString() });
    }
    return c.json({ success: false, message: "Failed to punish" });
  }
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
