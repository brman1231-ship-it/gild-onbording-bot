const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();

// Render ፖርት እንዲሰጠን የግድ ያስፈልጋል
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is Alive!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// የቦትህ ቶክን (ከBotFather የምታገኘው)
const token = process.env.BOT_TOKEN;

// ቦቱን ማስጀመር
const bot = new TelegramBot(token, { polling: true });

// ቀላል የሰላምታ መልዕክት
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'ሰላም! ቦቱ በስኬት በ Render ላይ እየሰራ ነው።');
});

console.log("Bot process started...");
