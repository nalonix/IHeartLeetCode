

export function dateToUnixEpoch(date: Date) {
    return Math.floor(date.getTime() / 1000);
}
  

export function hoursDifference(epochTime1: number, epochTime2: number) {
    // Calculate the absolute difference in seconds
    const differenceInSeconds = Math.abs(epochTime1 - epochTime2);
    // Convert the difference from seconds to hours
    const differenceInHours = differenceInSeconds / 3600;
    return differenceInHours;
}
  

export const botApi = {
    sendMessage: async (text: string, chat_id: string) => {
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
    sendPhoto: async (url: string, chat_id: string, caption: string = '') => {
        const urlEncodedData = new URLSearchParams({photo: url, caption: caption, chat_id}).toString();
        
        const response = await fetch(`https://api.telegram.org/bot${process.env.BOT_API}/sendMedia`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: urlEncodedData,
        });

        return response;
    }
}