const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const app = express();

// 1. Render ሰርቨሩ እንዳይዘጋው ፖርት ማሰሪያ (Port Binding)
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('GILD Bot is Alive and Running!');
});
app.listen(PORT, () => {
    console.log(`GILD Bot Server is running on port ${PORT}`);
});

// 2. የቦት ቶከን
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// 3. /start ኮማንድ - ቋንቋ ማስመረጫ
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const options = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{ text: 'አማርኛ 🇪🇹', callback_data: 'lang_am' }, { text: 'English 🇬🇧', callback_data: 'lang_en' }]
            ]
        })
    };
    bot.sendMessage(chatId, 'Welcome to GILD Marketing Agency! \nእባክዎ ቋንቋ ይምረጡ / Please choose a language:', options);
});

// 4. የተጠቃሚውን ምርጫ መቀበያ (Callback Queries)
bot.on('callback_query', (callbackQuery) => {
    const message = callbackQuery.message;
    const data = callbackQuery.data;
    const chatId = message.chat.id;

    // ቋንቋ አማርኛ ሲመረጥ
    if (data === 'lang_am') {
        const options = {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{ text: 'ለቪዲዮ ኤዲተሮች (Video Editors)', callback_data: 'role_am_vid' }],
                    [{ text: 'ለግራፊክስ ዲዛይነሮች (Graphic Designers)', callback_data: 'role_am_gfx' }]
                ]
            })
        };
        bot.sendMessage(chatId, 'ሰላም! እባክዎ የሙያ ዘርፍዎን ይምረጡ፦', options);
    } 
    
    // ቋንቋ እንግሊዘኛ ሲመረጥ
    else if (data === 'lang_en') {
        const options = {
            reply_markup: JSON.stringify({
                inline_keyboard: [
                    [{ text: 'Video Editors & SMM', callback_data: 'role_en_vid' }],
                    [{ text: 'Graphic Designers', callback_data: 'role_en_gfx' }]
                ]
            })
        };
        bot.sendMessage(chatId, 'Hello! Please select your profession:', options);
    }

    // አማርኛ - ቪዲዮ ኤዲተር
    else if (data === 'role_am_vid') {
        const textAmVid = `
<b>1. ለቪዲዮ ኤዲተሮች (Video Editors & SMM)</b>

<b>የ GILD ራዕይ እና ዋና ስራ</b>
GILD የዲጂታል ማርኬቲንግ እና የብራንዲንግ 'ወርቃማ' ደረጃ ነው። ዓላማችን በሀገር ውስጥ ብቻ ሳይሆን በዓለም አቀፍ ደረጃ ተፅዕኖ ፈጣሪ ስራዎችን መስራት ነው። ዋና ስራችን የቢዝነሶችን ማንነት መገንባት እና ሽያጫቸውን በፈጠራ ስራዎች ማሳደግ ነው።

<b>ለቪዲዮ ኤዲተሮች የተሰጠ መመሪያ</b>
▪️ <b>SMM ቁጥጥር፦</b> የቪዲዮ ይዘቶችን ከመቅረጽ ባለፈ አጠቃላይ የማህበራዊ ገጽ (SMM) እንቅስቃሴውን ሙሉ በሙሉ የመቆጣጠር ኃላፊነት አለብዎት።
▪️ <b>Creative Mastery፦</b> እያንዳንዱ ቪዲዮ ልዩ የፈጠራ እይታ (Creative edge) ያለው እና ተመልካችን የሚቆጣጠር መሆን አለበት።
▪️ <b>የግብአት አቅርቦት፦</b> ለስራው የሚያስፈልጉ ማንኛቸውም የቪዲዮ ግብአቶችን (Assets) ባለሙያው በራሱ የማዘጋጀት ግዴታ አለበት። ኤጀንሲው ግብአቶችን አያቀርብም።
▪️ <b>ክፍያ፦</b> ክፍያ በየፕሮጀክቱ (Per Project) የሚፈጸም ይሆናል።

<b>ተጨማሪ መረጃ</b>
▫️ GILD በይፋ ስራ የሚጀምረው May 15, 2026 ነው።
▫️ ማንኛውም ስራው የተሻለ እንዲሆን የሚረዱ አስተያየቶች በደስታ ይስተናገዳሉ።

"አብረን እንድጋለን!" 🌟
`;
        bot.sendMessage(chatId, textAmVid, { parse_mode: 'HTML' });
    }

    // አማርኛ - ግራፊክስ ዲዛይነር
    else if (data === 'role_am_gfx') {
        const textAmGfx = `
<b>2. ለግራፊክስ ዲዛይነሮች (Graphic Designers)</b>

<b>የ GILD ራዕይ እና ዋና ስራ</b>
GILD የዲጂታል ማርኬቲንግ እና የብራንዲንግ 'ወርቃማ' ደረጃ ነው። ዓላማችን በሀገር ውስጥ ብቻ ሳይሆን በዓለም አቀፍ ደረጃ ተፅዕኖ ፈጣሪ ስራዎችን መስራት ነው። ዋና ስራችን የቢዝነሶችን ማንነት መገንባት እና ሽያጫቸውን በፈጠራ ስራዎች ማሳደግ ነው።

<b>ለግራፊክስ ዲዛይነሮች የተሰጠ መመሪያ</b>
▪️ <b>Creative Liberty፦</b> በ GILD የብራንድ መመሪያ ውስጥ ሆነው የራስዎን የፈጠራ አሻራ እንዲያሳርፉ ሙሉ ነፃነት ይሰጥዎታል።
▪️ <b>የጥራት ደረጃ፦</b> ስራዎችዎ የ GILDን "Minimalist Luxury" ስታይል የጠበቁ እና ዓለም አቀፍ ደረጃን ያሟሉ መሆን አለባቸው።
▪️ <b>የግብአት አቅርቦት፦</b> ለዲዛይን የሚያስፈልጉ ፎቶዎችን እና ሌሎች ግብአቶችን (Assets) ባለሙያው በራሱ የማዘጋጀት ግዴታ አለበት። ኤጀንሲው ግብአቶችን አያቀርብም።
▪️ <b>ክፍያ፦</b> ክፍያ በየፕሮጀክቱ (Per Project) የሚፈጸም ይሆናል።

<b>ተጨማሪ መረጃ</b>
▫️ GILD በይፋ ስራ የሚጀምረው May 15, 2026 ነው።
▫️ ማንኛውም ስራው የተሻለ እንዲሆን የሚረዱ አስተያየቶች በደስታ ይስተናገዳሉ።

"አብረን እንድጋለን!" 🌟
`;
        bot.sendMessage(chatId, textAmGfx, { parse_mode: 'HTML' });
    }

    // English - Video Editor
    else if (data === 'role_en_vid') {
        const textEnVid = `
<b>1. For Video Editors & SMM</b>

<b>GILD Vision & Core Work</b>
GILD is the 'golden' standard of digital marketing and branding. Our goal is to create impactful work not only locally but globally. Our main focus is building business identities and increasing sales through creative works.

<b>Guidelines for Video Editors</b>
▪️ <b>SMM Control:</b> Beyond video editing, you are fully responsible for managing the overall Social Media Marketing (SMM) activities.
▪️ <b>Creative Mastery:</b> Each video must have a unique creative edge and captivate the audience.
▪️ <b>Asset Provision:</b> The professional is required to source and prepare any video assets needed for the job. The agency does not provide assets.
▪️ <b>Payment:</b> Payment will be made per project.

<b>Additional Information</b>
▫️ GILD officially launches on May 15, 2026.
▫️ Any feedback to improve the workflow is warmly welcomed.

"We will grow together!" 🌟
`;
        bot.sendMessage(chatId, textEnVid, { parse_mode: 'HTML' });
    }

    // English - Graphic Designer
    else if (data === 'role_en_gfx') {
        const textEnGfx = `
<b>2. For Graphic Designers</b>

<b>GILD Vision & Core Work</b>
GILD is the 'golden' standard of digital marketing and branding. Our goal is to create impactful work not only locally but globally. Our main focus is building business identities and increasing sales through creative works.

<b>Guidelines for Graphic Designers</b>
▪️ <b>Creative Liberty:</b> Within the GILD brand guidelines, you are given full freedom to leave your creative mark.
▪️ <b>Quality Standard:</b> Your work must maintain GILD's "Minimalist Luxury" style and meet international standards.
▪️ <b>Asset Provision:</b> The professional is required to source and prepare photos and other assets needed for the design. The agency does not provide assets.
▪️ <b>Payment:</b> Payment will be made per project.

<b>Additional Information</b>
▫️ GILD officially launches on May 15, 2026.
▫️ Any feedback to improve the workflow is warmly welcomed.

"We will grow together!" 🌟
`;
        bot.sendMessage(chatId, textEnGfx, { parse_mode: 'HTML' });
    }
});
