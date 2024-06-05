

function dateToUnixEpoch(date) {
    return Math.floor(date.getTime() / 1000);
}
  

function hoursDifference(epochTime1, epochTime2) {
    // Calculate the absolute difference in seconds
    const differenceInSeconds = Math.abs(epochTime1 - epochTime2);
    // Convert the difference from seconds to hours
    const differenceInHours = differenceInSeconds / 3600;
    return differenceInHours;
}
  

const botApi = {
    sendMessage: async (text, chat_id) => {
        const urlEncodedData = new URLSearchParams({text, chat_id}).toString();

        const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_API}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
            body: urlEncodedData,
        });

        return response;
    },
    sendPhoto: async (url, chat_id, caption = '') => {
        console.log()
        const urlEncodedData = new URLSearchParams({photo: url, caption, chat_id }).toString();
        
        const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_API}/sendPhoto`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: urlEncodedData,
        });

        console.log("👉👉 ",await response.json())

        return response;
    }
}

module.exports = {
    dateToUnixEpoch,
    hoursDifference,
    botApi
}