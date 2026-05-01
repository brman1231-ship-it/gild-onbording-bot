require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const https = require('https');

// ═══════════════════════════════════════════
//   SERVER & KEEP-ALIVE
// ═══════════════════════════════════════════
const app = express();
app.get('/', (req, res) => res.send('GILD Talent Bot is Running! ⚜️'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

// Cron — keep alive every 10 minutes
const APP_URL = process.env.APP_URL || `http://localhost:${PORT}`;
setInterval(() => {
  https.get(APP_URL, (res) => {
    console.log(`🔄 Keep-alive ping: ${res.statusCode}`);
  }).on('error', (e) => {
    console.error(`❌ Keep-alive error: ${e.message}`);
  });
}, 10 * 60 * 1000);

// ═══════════════════════════════════════════
//   BOT SETUP
// ═══════════════════════════════════════════
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// ── State Storage ──
const userState    = {}; // current step
const userData     = {}; // collected data
const userLang     = {}; // EN or AM
const userRole     = {}; // video_editor | graphic_designer

// ── Admin Telegram ID (change to your ID) ──
const ADMIN_ID = process.env.ADMIN_ID || 'YOUR_ADMIN_ID';

// ═══════════════════════════════════════════
//   BOT COMMANDS
// ═══════════════════════════════════════════
bot.setMyCommands([
  { command: '/start',  description: 'ጀምር / Start' },
  { command: '/about',  description: 'ስለ GILD / About GILD' },
  { command: '/apply',  description: 'አመልክት / Apply Now' },
  { command: '/help',   description: 'እርዳታ / Help' },
]);

// ═══════════════════════════════════════════
//   CONTENT DATA
// ═══════════════════════════════════════════
const RIGHTS_DUTIES = {
  video_editor: {
    EN: `<b>⚜️ GILD VIDEO EDITOR — Rights & Duties</b>

<b>YOUR RIGHTS:</b>
◆ Receive detailed creative briefs for every project
◆ Access to GILD brand assets (fonts, colors, templates)
◆ Fair and timely compensation per delivered video
◆ Creative freedom within brand guidelines
◆ Portfolio rights — use completed work in your portfolio (with approval)
◆ Priority consideration for long-term contract roles
◆ Direct communication with GILD creative director

<b>YOUR DUTIES:</b>
◆ Deliver videos on time as per agreed deadline
◆ Follow GILD brand guidelines strictly (colors, fonts, style)
◆ Submit work for internal review before final export
◆ Maintain confidentiality of all client information
◆ Respond to revision requests within 24 hours
◆ Maintain professional conduct in all communications
◆ Ensure all exported files meet platform specifications

<b>QUALITY STANDARD:</b>
◆ All videos must be exported at minimum 1080p
◆ Audio must be clear, balanced, and copyright-free
◆ Captions/subtitles required for all content
◆ Color grading must match GILD's premium aesthetic

<i>By proceeding, you agree to uphold these standards.</i>`,

    AM: `<b>⚜️ GILD ቪዲዮ አዘጋጅ — መብቶች እና ግዴታዎች</b>

<b>የእርስዎ መብቶች:</b>
◆ ለእያንዳንዱ ፕሮጀክት ዝርዝር creative brief ይቀበላሉ
◆ የ GILD ብራንድ ሀብቶች (fonts, colors, templates) ይጠቀማሉ
◆ ለእያንዳንዱ ቪዲዮ ፍትሃዊ እና ወቅታዊ ክፍያ ያገኛሉ
◆ በብራንድ መስፈርቶች ውስጥ ፈጠራዊ ነፃነት አለዎት
◆ የተጠናቀቁ ስራዎችን (ፈቃድ ካለ) ለ portfolio መጠቀም ይችላሉ
◆ ለረጅም ጊዜ ውል ቅድሚያ ያገኛሉ
◆ ከ GILD creative director ጋር ቀጥታ ግንኙነት

<b>የእርስዎ ግዴታዎች:</b>
◆ ቪዲዮዎችን በተስማሙበት ቀን ያቅርቡ
◆ የ GILD ብራንድ መስፈርቶችን (ቀለሞች፣ fonts፣ ስታይል) ያክብሩ
◆ ለ internal review ካስገቡ በኋላ ነው final export የሚደረገው
◆ ሁሉንም የደንበኛ መረጃ ሚስጥራዊ ያድርጉ
◆ ለ revision ጥያቄዎች በ 24 ሰዓት ውስጥ ይምለሱ
◆ በሁሉም ግንኙነቶች ፕሮፌሽናል ሁኑ
◆ የሚላኩ ፋይሎች የ platform መስፈርቶችን ማሟላት አለባቸው

<b>የጥራት መለኪያ:</b>
◆ ሁሉም ቪዲዮዎች ቢያንስ 1080p ሆነው ይላካሉ
◆ ድምፅ ግልፅ፣ ሚዛናዊ እና copyright-free መሆን አለበት
◆ ለሁሉም ይዘቶች captions/subtitles ያስፈልጋሉ
◆ Color grading የ GILD premium aesthetic ማሳካት አለበት

<i>ቀጥለው በመሄድ እነዚህን መስፈርቶች ለማክበር ተስማምተዋል።</i>`
  },

  graphic_designer: {
    EN: `<b>⚜️ GILD GRAPHIC DESIGNER — Rights & Duties</b>

<b>YOUR RIGHTS:</b>
◆ Receive comprehensive design briefs for every project
◆ Full access to GILD design system (brand book, assets, templates)
◆ Fair compensation per delivered design package
◆ Creative freedom within brand architecture
◆ Portfolio rights — showcase completed work (with approval)
◆ Priority for recurring monthly design retainers
◆ Direct feedback from GILD creative director

<b>YOUR DUTIES:</b>
◆ Deliver all designs on time per agreed schedule
◆ Strictly follow GILD brand guide (colors: #1a1a1a & #d4af37, approved fonts only)
◆ Submit all work for review before client delivery
◆ Maintain absolute confidentiality of all client assets
◆ Respond to revision requests within 24 hours
◆ Export files in all required formats (PNG, SVG, PDF, editable)
◆ Maintain premium quality — no stock designs, no templates

<b>QUALITY STANDARD:</b>
◆ All graphics minimum 300dpi for print, 72dpi for digital
◆ Deliver in organized, labeled folders
◆ Every design must feel premium, intentional, and on-brand
◆ Social media designs must be tested across mobile & desktop

<i>By proceeding, you agree to uphold these standards.</i>`,

    AM: `<b>⚜️ GILD ግራፊክ ዲዛይነር — መብቶች እና ግዴታዎች</b>

<b>የእርስዎ መብቶች:</b>
◆ ለእያንዳንዱ ፕሮጀክት ዝርዝር design brief ይቀበላሉ
◆ የ GILD design system ሙሉ ዳሳሽ (brand book, assets, templates)
◆ ለእያንዳንዱ design package ፍትሃዊ ክፍያ ያገኛሉ
◆ በብራንድ ድንበር ውስጥ ፈጠራዊ ነፃነት
◆ የተጠናቀቁ ስራዎችን (ፈቃድ ካለ) ለ portfolio ማሳየት ይችላሉ
◆ ወርሃዊ design retainer ቅድሚያ ያገኛሉ
◆ ከ GILD creative director ቀጥታ ግብረ-መልስ

<b>የእርስዎ ግዴታዎች:</b>
◆ ሁሉም designs በተስማሙበት ቀን ይላካሉ
◆ የ GILD brand guide ያክብሩ (ቀለሞች: #1a1a1a እና #d4af37, ፈቃድ ያላቸው fonts ብቻ)
◆ ለደንበኛ ከመላክ በፊት ለ review ያቅርቡ
◆ ሁሉንም የደንበኛ ሀብቶች ሚስጥራዊ ያድርጉ
◆ ለ revision ጥያቄ በ 24 ሰዓት ውስጥ ይምለሱ
◆ ሁሉም formats (PNG, SVG, PDF, editable) ሆነው ይላካሉ
◆ ፕሪሚዬም ጥራት ይጠበቃል — stock designs ወይም templates አይፈቀዱም

<b>የጥራት መለኪያ:</b>
◆ ሁሉም graphics ለ print 300dpi፣ ለ digital 72dpi ቢያንስ
◆ በተደራጀ፣ በተሰየሙ folders ይላካሉ
◆ እያንዳንዱ design premium፣ ሆን ተብሎ የተሰራ እና on-brand መሆን አለበት
◆ Social media designs mobile እና desktop ላይ ይፈተናሉ

<i>ቀጥለው በመሄድ እነዚህን መስፈርቶች ለማክበር ተስማምተዋል።</i>`
  }
};

const CREATIVE_BRIEF = {
  video_editor: {
    EN: `<b>🎬 YOUR FIRST CREATIVE BRIEF — GILD Launch Video</b>

<b>Project:</b> GILD Digital Agency — Brand Launch Reel
<b>Platform:</b> Instagram Reels / TikTok / Facebook
<b>Duration:</b> 30–45 seconds
<b>Deadline:</b> Opens on GILD Day 15

━━━━━━━━━━━━━━━━━━━━━━

<b>🎯 CONCEPT:</b>
A cinematic brand reveal video showing the transformation of a raw, ordinary brand into a gleaming gold premium identity. The "Peeling" effect — revealing gold beneath the surface.

<b>📝 SCRIPT DIRECTION:</b>
- Open: Dark screen, ambient sound
- Build: Show "before" — dull, unnoticed brand
- Climax: Golden peel effect revealing GILD's power
- Close: GILD logo + tagline "We Make You Gold."

<b>🎨 COLORS TO USE:</b>
- Primary Dark: <code>#1a1a1a</code>
- Gold Primary: <code>#d4af37</code>
- Gold Light: <code>#e8c97a</code>
- Gold Dark: <code>#b8960c</code>
- White: <code>#ffffff</code>

<b>🔤 FONTS TO USE:</b>
- Display/Title: <b>Cinzel</b> (Google Fonts — free)
- Body/Subtitles: <b>Montserrat</b> (Google Fonts — free)
- Accent/Italic: <b>Cormorant Garamond</b> (Google Fonts — free)

<b>🎵 MUSIC DIRECTION:</b>
Cinematic, luxury, minimal — think Apple product launch tone. No loud beats. Subtle, building tension. Copyright-free sources: Epidemic Sound / Pixabay

<b>📐 EXPORT SPECS:</b>
- Format: MP4 (H.264)
- Resolution: 1080 x 1920 (9:16 vertical)
- Frame Rate: 30fps minimum
- File Size: Under 100MB
- Subtitles: Burned in (white text, Montserrat)

<b>📩 SUBMIT TO:</b> @Farisman72`,

    AM: `<b>🎬 የእርስዎ የመጀመሪያ CREATIVE BRIEF — GILD Launch Video</b>

<b>ፕሮጀክት:</b> GILD Digital Agency — Brand Launch Reel
<b>ፕላትፎርም:</b> Instagram Reels / TikTok / Facebook
<b>ርዝመት:</b> 30–45 ሴኮንድ
<b>ቀነ-ገደብ:</b> GILD ቀን 15 ላይ ይከፈታል

━━━━━━━━━━━━━━━━━━━━━━

<b>🎯 ሀሳቡ:</b>
ተራ የሆነ ብራንድ ወደ አንፀባራቂ ወርቃማ ፕሪሚዬም ማንነት እንዴት እንደሚቀየር የሚያሳይ ሲኒማቲክ ቪዲዮ። "Peeling" effect — ከ surface ስር ወርቅ እንደሚወጣ።

<b>📝 የ SCRIPT አቅጣጫ:</b>
- መክፈቻ: ጨለማ ስክሪን፣ ambient ድምፅ
- ግንባታ: ሳቢ ያልሆነ ብራንድ "before" ሁኔታ
- ወርቃማ peel effect — GILD ኃይልን ይገልፃል
- መዝጊያ: GILD logo + "We Make You Gold."

<b>🎨 መጠቀም ያለባቸው ቀለሞች:</b>
- ጥቁር: <code>#1a1a1a</code>
- ወርቅ ዋና: <code>#d4af37</code>
- ወርቅ ቀላል: <code>#e8c97a</code>
- ወርቅ ጨለማ: <code>#b8960c</code>
- ነጭ: <code>#ffffff</code>

<b>🔤 መጠቀም ያለባቸው Fonts:</b>
- ዋና/Title: <b>Cinzel</b> (Google Fonts)
- Body/Subtitles: <b>Montserrat</b> (Google Fonts)
- Accent: <b>Cormorant Garamond</b> (Google Fonts)

<b>🎵 የሙዚቃ አቅጣጫ:</b>
Cinematic፣ luxury፣ minimal — Apple product launch አይነት። ጩኸታማ beats አይፈቀዱም። Subtle፣ የሚያድግ tension። Copyright-free: Epidemic Sound / Pixabay

<b>📐 Export Specs:</b>
- Format: MP4 (H.264)
- Resolution: 1080 x 1920 (9:16 vertical)
- Frame Rate: ቢያንስ 30fps
- File Size: ከ 100MB በታች
- Subtitles: Burned in (ነጭ ፅሁፍ፣ Montserrat)

<b>📩 ለማስገባት:</b> @Farisman72`
  },

  graphic_designer: {
    EN: `<b>🎨 YOUR FIRST CREATIVE BRIEF — GILD Social Media Launch Pack</b>

<b>Project:</b> GILD Digital Agency — Launch Content Pack
<b>Platform:</b> Instagram / Facebook / TikTok
<b>Deliverables:</b> 5 premium launch posts
<b>Deadline:</b> Opens on GILD Day 15

━━━━━━━━━━━━━━━━━━━━━━

<b>🎯 CONCEPT:</b>
A set of 5 premium, cinematic social media posts announcing GILD's arrival. Each post must feel like a luxury brand campaign — dark, gold, powerful, minimal.

<b>📐 POST SIZES:</b>
- Feed Post: 1080 x 1080px (1:1)
- Story/Reel Cover: 1080 x 1920px (9:16)
- Facebook Cover: 820 x 312px

<b>🎨 COLORS TO USE:</b>
- Primary Dark: <code>#1a1a1a</code>
- Gold Primary: <code>#d4af37</code>
- Gold Light: <code>#e8c97a</code>
- Gold Dark: <code>#b8960c</code>
- Surface: <code>#242424</code>
- White: <code>#ffffff</code>

<b>🔤 FONTS TO USE:</b>
- Headlines: <b>Cinzel</b> (Google Fonts — free)
- Body Text: <b>Montserrat</b> (Google Fonts — free)
- Italic Accent: <b>Cormorant Garamond</b> (Google Fonts — free)

<b>✏️ POST CONCEPTS (5 posts):</b>
1. "We Don't Just Market. We Make You Gold." — Brand reveal
2. GILD Luster package teaser — minimal, premium card style
3. GILD Radiant package teaser — bold, conversion-focused
4. GILD 24K package teaser — empire, cinematic feel
5. "Coming Soon" countdown — dark, atmospheric, gold particles

<b>📦 EXPORT FORMATS:</b>
- PNG (transparent background where applicable)
- JPG (final social versions)
- Editable source file (Canva / Illustrator / Figma)
- Organized labeled folder

<b>📩 SUBMIT TO:</b> @Farisman72`,

    AM: `<b>🎨 የእርስዎ የመጀመሪያ CREATIVE BRIEF — GILD Social Media Launch Pack</b>

<b>ፕሮጀክት:</b> GILD Digital Agency — Launch Content Pack
<b>ፕላትፎርም:</b> Instagram / Facebook / TikTok
<b>የሚቀርቡ ነገሮች:</b> 5 premium launch posts
<b>ቀነ-ገደብ:</b> GILD ቀን 15 ላይ ይከፈታል

━━━━━━━━━━━━━━━━━━━━━━

<b>🎯 ሀሳቡ:</b>
የ GILD መምጣትን የሚያበስሩ 5 ፕሪሚዬም የሶሻል ሚዲያ posts። እያንዳንዱ post የ luxury brand campaign መምሰል አለበት — ጨለማ፣ ወርቃማ፣ ኃይለኛ፣ minimal።

<b>📐 የ POST መጠኖች:</b>
- Feed Post: 1080 x 1080px (1:1)
- Story/Reel Cover: 1080 x 1920px (9:16)
- Facebook Cover: 820 x 312px

<b>🎨 መጠቀም ያለባቸው ቀለሞች:</b>
- ጥቁር: <code>#1a1a1a</code>
- ወርቅ ዋና: <code>#d4af37</code>
- ወርቅ ቀላል: <code>#e8c97a</code>
- ወርቅ ጨለማ: <code>#b8960c</code>
- Surface: <code>#242424</code>
- ነጭ: <code>#ffffff</code>

<b>🔤 መጠቀም ያለባቸው Fonts:</b>
- Headlines: <b>Cinzel</b> (Google Fonts)
- Body Text: <b>Montserrat</b> (Google Fonts)
- Accent: <b>Cormorant Garamond</b> (Google Fonts)

<b>✏️ 5 Posts ሀሳቦች:</b>
1. "We Don't Just Market. We Make You Gold." — Brand reveal
2. GILD Luster package teaser — minimal, premium card style
3. GILD Radiant package teaser — bold, conversion-focused
4. GILD 24K package teaser — empire, cinematic feel
5. "Coming Soon" countdown — dark, atmospheric, gold particles

<b>📦 Export Formats:</b>
- PNG (transparent background ካስፈለገ)
- JPG (final social versions)
- Editable source file (Canva / Illustrator / Figma)
- በተደራጀ labeled folder

<b>📩 ለማስገባት:</b> @Farisman72`
  }
};

const ABOUT_GILD = {
  EN: `<b>⚜️ ABOUT GILD DIGITAL AGENCY</b>

<i>"We Don't Just Market. We Make You Gold."</i>

━━━━━━━━━━━━━━━━━━━━━━

GILD is East Africa's premier digital marketing agency, built for ambitious brands that refuse to blend in.

We are strategists, creatives, and technologists united by one belief: <b>your brand deserves the golden standard.</b>

<b>WHAT WE DO:</b>
◆ Brand Identity & Visual Architecture
◆ Social Media Management & Growth
◆ Paid Advertising (Meta, Google, TikTok)
◆ Website & Landing Page Design
◆ AI-Powered Telegram Bots
◆ Cinematic Brand Videos
◆ SEO & Digital Authority Building

<b>WHY GILD?</b>
Most agencies post content. We build empires. Every campaign, every design, every word is crafted with precision — because average is not in our vocabulary.

<b>OUR PROMISE:</b>
If we take on your brand, we treat it like our own. Your growth is our obsession. Your gold is our standard.

<b>Est. 2024 · Addis Ababa, Ethiopia</b>
<i>Serving clients across East Africa and beyond.</i>

━━━━━━━━━━━━━━━━━━━━━━
🔗 Telegram: @gild_agency
📸 Instagram: @gild_agency
🎵 TikTok: @gild.agency`,

  AM: `<b>⚜️ ስለ GILD DIGITAL AGENCY</b>

<i>"We Don't Just Market. We Make You Gold."</i>

━━━━━━━━━━━━━━━━━━━━━━

GILD በምስራቅ አፍሪካ ውስጥ ተወዳዳሪ ለሌለው ከፍተኛ ደረጃ ብራንዶች የሚሰራ ፕሪሚዬም ዲጂታል ማርኬቲንግ ኤጀንሲ ነው።

እኛ ስትራቴጂስቶች፣ ፈጣሪዎች እና ቴክኖሎጂ ባለሙያዎች ነን — በአንድ እምነት ሁሉ የተዋሃድን፦ <b>ብራንድዎ ወርቃማ ደረጃ ይገባዋል።</b>

<b>የምንሰራቸው ነገሮች:</b>
◆ Brand Identity እና Visual Architecture
◆ Social Media Management እና Growth
◆ Paid Advertising (Meta, Google, TikTok)
◆ Website እና Landing Page Design
◆ AI-Powered Telegram Bots
◆ Cinematic Brand Videos
◆ SEO እና Digital Authority Building

<b>ለምን GILD?</b>
አብዛኞቹ ኤጀንሲዎች content ይለቃሉ። እኛ ግዛቶችን እንገነባለን። እያንዳንዱ campaign፣ እያንዳንዱ ዲዛይን፣ እያንዳንዱ ቃል በጥንቃቄ ይሰራል — ምክንያቱም "ተራ" የሚለው ቃል መዝገበ ቃላታችን ውስጥ የለም።

<b>ቃላችን:</b>
ብራንድዎን ብንወስድ ፣ እንደ ራሳችን ብራንድ እናስተናግደዋለን። የእርስዎ እድገት የእኛ ቅናት ነው።

<b>ከ 2024 · አዲስ አበባ፣ ኢትዮጵያ</b>
<i>በምስራቅ አፍሪካ እና ከዚያ ባሻገር ደንበኞችን እናገለግላለን።</i>

━━━━━━━━━━━━━━━━━━━━━━
🔗 Telegram: @gild_agency
📸 Instagram: @gild_agency
🎵 TikTok: @gild.agency`
};

// ═══════════════════════════════════════════
//   HELPER FUNCTIONS
// ═══════════════════════════════════════════
function isEn(chatId) {
  return userLang[chatId] === 'EN';
}

function sendMainMenu(chatId) {
  const en = isEn(chatId);
  const text = en
    ? `⚜️ <b>GILD TALENT PORTAL</b>\n\n<i>"Join the team that makes brands gold."</i>\n\nWelcome to GILD's exclusive creative talent network. We are building East Africa's most premium digital agency — and we want the best creators on our team.\n\nWhat would you like to do?`
    : `⚜️ <b>GILD TALENT PORTAL</b>\n\n<i>"ብራንዶችን ወርቃማ የሚያደርገው ቡድን ተቀላቀሉ።"</i>\n\nወደ GILD ልዩ creative talent network እንኳን በደህና መጡ። በምስራቅ አፍሪካ ምርጡን ፕሪሚዬም ዲጂታል ኤጀንሲ እየገነባን ነው — ምርጥ ፈጣሪዎችን ቡድናችን ላይ እንፈልጋለን።\n\nምን ማድረግ ይፈልጋሉ?`;

  bot.sendMessage(chatId, text, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{ text: en ? "🎬 APPLY AS VIDEO EDITOR" : "🎬 እንደ ቪዲዮ አዘጋጅ አመልክት", callback_data: 'role_video_editor' }],
        [{ text: en ? "🎨 APPLY AS GRAPHIC DESIGNER" : "🎨 እንደ ግራፊክ ዲዛይነር አመልክት", callback_data: 'role_graphic_designer' }],
        [{ text: en ? "🏛️ ABOUT GILD" : "🏛️ ስለ GILD", callback_data: 'about' }],
        [{ text: en ? "❓ HOW IT WORKS" : "❓ እንዴት ይሰራል", callback_data: 'how_it_works' }],
      ]
    }
  });
}

function sendLangSelection(chatId) {
  bot.sendMessage(chatId,
    `⚜️ Welcome to <b>GILD Talent Portal</b>.\n\nPlease select your language.\nቋንቋዎን ይምረጡ።`,
    {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            { text: "🇬🇧 ENGLISH", callback_data: 'lang_EN' },
            { text: "🇪🇹 አማርኛ",   callback_data: 'lang_AM' }
          ]
        ]
      }
    }
  );
}

// ═══════════════════════════════════════════
//   /start
// ═══════════════════════════════════════════
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userState[chatId] = null;
  userData[chatId]  = {};
  sendLangSelection(chatId);
});

bot.onText(/\/about/, (msg) => {
  const chatId = msg.chat.id;
  const en = isEn(chatId);
  bot.sendMessage(chatId, en ? ABOUT_GILD.EN : ABOUT_GILD.AM, { parse_mode: 'HTML' });
});

bot.onText(/\/apply/, (msg) => {
  const chatId = msg.chat.id;
  sendMainMenu(chatId);
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  const en = isEn(chatId);
  bot.sendMessage(chatId,
    en
      ? `<b>⚜️ GILD TALENT PORTAL — Help</b>\n\n/start — Restart the portal\n/apply — Apply for a role\n/about — Learn about GILD\n/help — Show this message\n\nFor direct support: @Farisman72`
      : `<b>⚜️ GILD TALENT PORTAL — እርዳታ</b>\n\n/start — ፖርታሉን እንደገና ጀምር\n/apply — ለሚና አመልክት\n/about — ስለ GILD ተወቅ\n/help — ይህን መልዕክት አሳይ\n\nቀጥታ ድጋፍ: @Farisman72`,
    { parse_mode: 'HTML' }
  );
});

// ═══════════════════════════════════════════
//   TEXT MESSAGE HANDLER (form steps)
// ═══════════════════════════════════════════
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text   = msg.text;
  if (!text || text.startsWith('/')) return;

  const en    = isEn(chatId);
  const state = userState[chatId];

  if (state === 'AWAIT_NAME') {
    userData[chatId].name = text;
    userState[chatId] = 'AWAIT_PHONE';
    bot.sendMessage(chatId,
      en
        ? `✅ <b>Name noted.</b>\n\nPlease provide your <b>phone number</b>:\n<i>(e.g. +251911234567)</i>`
        : `✅ <b>ስምዎ ተመዝግቧል።</b>\n\nእባክዎ <b>ስልክ ቁጥርዎን</b> ያስገቡ:\n<i>(ለምሳሌ +251911234567)</i>`,
      { parse_mode: 'HTML' }
    );
    return;
  }

  if (state === 'AWAIT_PHONE') {
    userData[chatId].phone = text;
    userState[chatId] = 'AWAIT_ADDRESS';
    bot.sendMessage(chatId,
      en
        ? `✅ <b>Phone noted.</b>\n\nPlease enter your <b>city / location</b>:\n<i>(e.g. Addis Ababa)</i>`
        : `✅ <b>ስልክ ቁጥርዎ ተመዝግቧል።</b>\n\nእባክዎ <b>ከተማዎን / አድራሻዎን</b> ያስገቡ:\n<i>(ለምሳሌ አዲስ አበባ)</i>`,
      { parse_mode: 'HTML' }
    );
    return;
  }

  if (state === 'AWAIT_ADDRESS') {
    userData[chatId].address = text;
    userState[chatId] = null;

    const role     = userRole[chatId];
    const roleLabel = role === 'video_editor'
      ? (en ? 'Video Editor' : 'ቪዲዮ አዘጋጅ')
      : (en ? 'Graphic Designer' : 'ግራፊክ ዲዛይነር');

    const d = userData[chatId];
    const username = msg.from.username ? `@${msg.from.username}` : en ? 'No username' : 'Username የለም';

    // ── Send brief to applicant ──
    const briefContent = role === 'video_editor'
      ? (en ? CREATIVE_BRIEF.video_editor.EN : CREATIVE_BRIEF.video_editor.AM)
      : (en ? CREATIVE_BRIEF.graphic_designer.EN : CREATIVE_BRIEF.graphic_designer.AM);

    const confirmText = en
      ? `⚜️ <b>Registration Complete!</b>\n\n<b>Summary:</b>\n• Name: ${d.name}\n• Phone: ${d.phone}\n• Location: ${d.address}\n• Role: ${roleLabel}\n• Telegram: ${username}\n\nBelow is your <b>first creative brief</b>. Study it carefully — work begins on <b>GILD Day 15</b>.`
      : `⚜️ <b>ምዝገባ ተጠናቋል!</b>\n\n<b>ማጠቃለያ:</b>\n• ስም: ${d.name}\n• ስልክ: ${d.phone}\n• አድራሻ: ${d.address}\n• ሚና: ${roleLabel}\n• Telegram: ${username}\n\nከዚህ በታች <b>የመጀመሪያ creative brief</b>ዎ ነው። በጥንቃቄ ያንብቡ — ስራው <b>GILD ቀን 15</b> ላይ ይጀምራል።`;

    bot.sendMessage(chatId, confirmText, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: en ? "📋 VIEW MY BRIEF" : "📋 BRIEF ዬን ይሳዩ", callback_data: 'view_brief' }],
          [{ text: en ? "🏠 MAIN MENU" : "🏠 ዋና ማውጫ", callback_data: 'main_menu' }]
        ]
      }
    });

    // ── Notify admin ──
    const adminMsg = `🔔 <b>NEW GILD TALENT APPLICATION</b>\n\n👤 Name: ${d.name}\n📞 Phone: ${d.phone}\n📍 Location: ${d.address}\n🎭 Role: ${roleLabel}\n🔗 Telegram: ${username}\n🌐 Language: ${en ? 'English' : 'Amharic'}\n\n⚜️ Review and follow up.`;
    bot.sendMessage(ADMIN_ID, adminMsg, { parse_mode: 'HTML' }).catch(() => {});

    return;
  }
});

// ═══════════════════════════════════════════
//   CALLBACK HANDLER
// ═══════════════════════════════════════════
bot.on('callback_query', (query) => {
  const chatId    = query.message.chat.id;
  const messageId = query.message.message_id;
  const data      = query.data;
  const en        = isEn(chatId);

  bot.answerCallbackQuery(query.id).catch(() => {});

  // ── Language ──
  if (data === 'lang_EN' || data === 'lang_AM') {
    userLang[chatId] = data === 'lang_EN' ? 'EN' : 'AM';
    bot.deleteMessage(chatId, messageId).catch(() => {});
    sendMainMenu(chatId);
    return;
  }

  // ── Main Menu ──
  if (data === 'main_menu') {
    bot.deleteMessage(chatId, messageId).catch(() => {});
    sendMainMenu(chatId);
    return;
  }

  // ── About ──
  if (data === 'about') {
    bot.editMessageText(en ? ABOUT_GILD.EN : ABOUT_GILD.AM, {
      chat_id: chatId, message_id: messageId, parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: en ? "🎯 APPLY NOW" : "🎯 አሁን አመልክት", callback_data: 'main_menu' }],
          [{ text: en ? "🔙 BACK" : "🔙 ወደ ኋላ", callback_data: 'main_menu' }]
        ]
      }
    });
    return;
  }

  // ── How It Works ──
  if (data === 'how_it_works') {
    const text = en
      ? `<b>⚜️ HOW THE GILD TALENT PORTAL WORKS</b>\n\n<b>Step 1 — Choose Your Role</b>\nSelect whether you are a Video Editor or Graphic Designer.\n\n<b>Step 2 — Read Rights & Duties</b>\nReview the professional standards you agree to uphold.\n\n<b>Step 3 — Accept & Register</b>\nFill in your name, phone, and location.\n\n<b>Step 4 — Receive Your Brief</b>\nGet your first creative brief — study it carefully.\n\n<b>Step 5 — Submit Your Work</b>\nDeliver your work via Telegram to @Farisman72.\n\n<b>Step 6 — Get Selected</b>\nTop talent joins the GILD team for ongoing projects.\n\n<i>GILD opens officially on Day 15. Selected creators will be notified.</i>`
      : `<b>⚜️ GILD TALENT PORTAL እንዴት ይሰራል</b>\n\n<b>ደረጃ 1 — ሚናዎን ይምረጡ</b>\nቪዲዮ አዘጋጅ ወይም ግራፊክ ዲዛይነር መሆንዎን ይምረጡ።\n\n<b>ደረጃ 2 — መብቶች እና ግዴታዎች ያንብቡ</b>\nለማክበር የሚስማሙባቸውን ፕሮፌሽናል መስፈርቶች ያንብቡ።\n\n<b>ደረጃ 3 — ተስማምቶ ይመዝገቡ</b>\nስምዎን፣ ስልክ ቁጥርዎን እና አድራሻዎን ያስገቡ።\n\n<b>ደረጃ 4 — Brief ይቀበሉ</b>\nየመጀመሪያ creative briefዎን ይቀበሉ — በጥንቃቄ ያጠኑ።\n\n<b>ደረጃ 5 — ስራዎን ያስገቡ</b>\nስራዎን በ Telegram ወደ @Farisman72 ያስገቡ።\n\n<b>ደረጃ 6 — ይመረጡ</b>\nምርጥ ፈጣሪዎች ለቀጣይ ፕሮጀክቶች GILD ቡድን ይቀላቀላሉ።\n\n<i>GILD በይፋ ቀን 15 ላይ ይከፈታል። የተመረጡ ፈጣሪዎች ያሳወቃሉ።</i>`;

    bot.editMessageText(text, {
      chat_id: chatId, message_id: messageId, parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: en ? "🎯 APPLY NOW" : "🎯 አሁን አመልክት", callback_data: 'main_menu' }],
          [{ text: en ? "🔙 BACK" : "🔙 ወደ ኋላ", callback_data: 'main_menu' }]
        ]
      }
    });
    return;
  }

  // ── Role Selection ──
  if (data === 'role_video_editor' || data === 'role_graphic_designer') {
    userRole[chatId] = data === 'role_video_editor' ? 'video_editor' : 'graphic_designer';
    const role = userRole[chatId];
    const rights = role === 'video_editor'
      ? (en ? RIGHTS_DUTIES.video_editor.EN   : RIGHTS_DUTIES.video_editor.AM)
      : (en ? RIGHTS_DUTIES.graphic_designer.EN : RIGHTS_DUTIES.graphic_designer.AM);

    bot.editMessageText(rights, {
      chat_id: chatId, message_id: messageId, parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: en ? "✅ I AGREE — FILL FORM" : "✅ ተስማምቻለሁ — ፎርም ሙላ", callback_data: 'agree_and_register' }],
          [{ text: en ? "🔙 BACK" : "🔙 ወደ ኋላ", callback_data: 'main_menu' }]
        ]
      }
    });
    return;
  }

  // ── Agree & Start Form ──
  if (data === 'agree_and_register') {
    userState[chatId] = 'AWAIT_NAME';
    userData[chatId]  = {};
    bot.editMessageText(
      en
        ? `⚜️ <b>Registration Form</b>\n\n<i>Step 1 of 3</i>\n\nPlease enter your <b>full name</b>:\n<i>(e.g. Abebe Kebede)</i>`
        : `⚜️ <b>የምዝገባ ፎርም</b>\n\n<i>ደረጃ 1 ከ 3</i>\n\nእባክዎ <b>ሙሉ ስምዎን</b> ያስገቡ:\n<i>(ለምሳሌ አበበ ከበደ)</i>`,
      { chat_id: chatId, message_id: messageId, parse_mode: 'HTML' }
    );
    return;
  }

  // ── View Brief ──
  if (data === 'view_brief') {
    const role = userRole[chatId];
    const brief = role === 'video_editor'
      ? (en ? CREATIVE_BRIEF.video_editor.EN    : CREATIVE_BRIEF.video_editor.AM)
      : (en ? CREATIVE_BRIEF.graphic_designer.EN : CREATIVE_BRIEF.graphic_designer.AM);

    bot.sendMessage(chatId, brief, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{ text: en ? "✅ BRIEF RECEIVED — I'M READY" : "✅ BRIEF ደረሰኝ — ዝግጁ ነኝ", callback_data: 'brief_confirmed' }]
        ]
      }
    });
    return;
  }

  // ── Brief Confirmed ──
  if (data === 'brief_confirmed') {
    const role = userRole[chatId];
    const roleLabel = role === 'video_editor'
      ? (en ? 'Video Editor' : 'ቪዲዮ አዘጋጅ')
      : (en ? 'Graphic Designer' : 'ግራፊክ ዲዛይነር');

    bot.editMessageText(
      en
        ? `⚜️ <b>You're officially part of the GILD network.</b>\n\nRole: <b>${roleLabel}</b>\n\nYour work will be reviewed when GILD opens on <b>Day 15</b>. The top creators will be selected for the team.\n\n<i>We build together. We shine together. We are GILD.</i>\n\n🔗 Stay connected: @gild_agency\n\n<b>In the meantime — prepare your best work. Gold doesn't wait.</b>`
        : `⚜️ <b>እርስዎ ኦፊሴላዊ የ GILD network አባል ሆኗሉ።</b>\n\nሚና: <b>${roleLabel}</b>\n\nስራዎ GILD <b>ቀን 15</b> ላይ ሲከፈት ይገመገማል። ምርጥ ፈጣሪዎች ለቡድኑ ይመረጣሉ።\n\n<i>አብረን እንገነባለን። አብረን እናበራለን። እኛ GILD ነን።</i>\n\n🔗 ተከታተሉ: @gild_agency\n\n<b>በዚህ ጊዜ — ምርጥ ስራዎን ያዘጋጁ። ወርቅ አይጠብቅም።</b>`,
      {
        chat_id: chatId, message_id: messageId, parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: en ? "🏠 MAIN MENU" : "🏠 ዋና ማውጫ", callback_data: 'main_menu' }],
            [{ text: en ? "🏛️ ABOUT GILD" : "🏛️ ስለ GILD", callback_data: 'about' }]
          ]
        }
      }
    );
    return;
  }
});
