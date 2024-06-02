import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { botApi, dateToUnixEpoch, hoursDifference } from './utils'
import { punishments } from './punishments'


const app = new Hono()
// app.use('/images/*', serveStatic({ root: path.join(__dirname, 'images') }))


let missedCount = 4;

const channelID = process.env.CHANNEL_ID as string
const leetCodeUsername = process.env.LEETCODE_USERNAME as string

app.get('/', async (c) => {
  const date = new Date(); 
  const unixEpochTime = dateToUnixEpoch(date);

  const resp = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${leetCodeUsername}`)
  const body = await resp.json()
  const lastPractice = body.recentSubmissions[0].timestamp

  const diffHours = hoursDifference(unixEpochTime, lastPractice);  

  let response: any;
  if(diffHours > 24){
    const punishment = punishments[missedCount.toString()]
    console.log(punishment)

    if(punishment.type === 'text'){
      response = await botApi.sendMessage(punishment.data, channelID)
    }else if(punishment.type === 'image'){
      console.log("I punish with photo")
      response = await botApi.sendPhoto('http://localhost:3000/punishments/images/day10image.jpg', channelID, "Hi")
    }
    // console.log(await resp.json())
    const responseData = await response.json();
    return c.json(responseData);
  }
  
  return c.json({ success: true, difference: diffHours.toString()})
})


const port = 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})
