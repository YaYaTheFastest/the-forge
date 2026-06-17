const { Telegraf } = require('telegraf');
const axios = require('axios');

const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('Please set TELEGRAM_BOT_TOKEN env var');
  process.exit(1);
}

const bot = new Telegraf(token);

const SITE_URL = process.env.SITE_URL || 'https://rockinjracing.com';
const AUTH = process.env.SITE_BASIC_AUTH || 'user:pass';

const authHeader = 'Basic ' + Buffer.from(AUTH).toString('base64');

console.log('Telegram Hermes bot started. Listening...');

// Prepend specific instructions for the BJJ domain factory
// Note: We send the raw user text only. The grok-chat route handles vault context, 
// intent detection (list/guard/polish/etc), search, and direct applies. No LLM prefix needed.
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  try {
    const res = await axios.post(`${SITE_URL}/api/forge/grok-chat`, {
      message: text,
      context: {
        isTechniquePage: /card|technique|gb1/i.test(text),
      }
    }, {
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      }
    });
    const reply = res.data.response || 'No response from system.';
    await ctx.reply(reply);
  } catch (err) {
    console.error(err);
    await ctx.reply('Error talking to the Forge: ' + (err.response?.data?.response || err.message));
  }
});

bot.launch();

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
