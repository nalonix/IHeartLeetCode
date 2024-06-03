const { Hono } = require('hono');
const { serve } = require('@hono/node-server');
const { serveStatic } = require('@hono/node-server/serve-static');

const { botApi, dateToUnixEpoch, hoursDifference } = require('./utils');
const { punishments } = require('./punishments');

const dotenv = require('dotenv');
dotenv.config();

const app = new Hono()

let missedCount = 1;

const channelID = process.env.CHANNEL_ID as string
const leetCodeUsername = process.env.LEETCODE_USERNAME as string

// Middleware to validate API key
app.use('/punishments/images/*', async (c, next) => {
  const apiKey = c.req.query('apiKey')
  console.log('the api key: ', apiKey)

  if (!apiKey || (apiKey !== process.env.INSTANCE_SECRET)) {
      return c.text('Forbidden', 403)
  }
  await next()
})

// Serve static images
app.use('/punishments/images/*', serveStatic({root: './src'}))

// Use middleware to validate the user
app.use('/', async (c, next) => {
  const apiKey = c.req.query('apiKey')
  console.log('the api key: ', apiKey)

  if (!apiKey || (apiKey !== process.env.INSTANCE_SECRET)) {
      return c.text('Forbidden', 403)
  }
  await next()
})

app.get('/', async (c) => {
  const date = new Date(); 
  const unixEpochTime = dateToUnixEpoch(date);



  const resp = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${leetCodeUsername}`)

  if(!resp.ok){
    return c.json({ success: false, message: "Failed to fetch from leetcode API"})
  }
  const body = await resp.json()

  const lastPractice = body.recentSubmissions[0].timestamp

  const diffHours = hoursDifference(unixEpochTime, lastPractice);  

  let response: any;

  // Make sure the difference is greater than 24 hours

  // If not greater than 24 hours, appreciate the user
  if(diffHours <= 24){
    response = await botApi.sendMessage(`You have submitted today, keep it up!`, channelID)
    if(response.ok){
      return c.json({ success: true, difference: diffHours.toString()})
    }
    return c.json({ success: false, message: "Failed to send message"})
  }

  // If greater than 24 hours, punish the user
  if(diffHours > 24){
    const punishment = punishments[missedCount.toString()]

    if(punishment.type === 'text'){
      response = await botApi.sendMessage(punishment.data, channelID)
    }else if(punishment.type === 'photo'){
      response = await botApi.sendPhoto( `${c.req.url}/punishments/images/${punishment.data}?apiKey=${process.env.INSTANCE_SECRET}`, channelID)
      return c.json(response)
    }

    if(response.ok){
      return c.json({ success: true, difference: diffHours.toString()})
    }
    return c.json({ success: false, message: "Failed to punish"})
  }
})


const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
