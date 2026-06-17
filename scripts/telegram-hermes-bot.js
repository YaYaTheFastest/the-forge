const { Telegraf } = require('telegraf');
const axios = require('axios');
const fs = require('fs');

let token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  // Fallback: allow a protected token file (chmod 600) so you do not have to paste the secret on every start
  try { token = fs.readFileSync('/root/.tg-bot-token', 'utf8').trim(); } catch (_) {}
  if (!token) {
    // Also try common alt locations
    for (const p of ['/root/.telegram-token', process.env.HOME + '/.tg-bot-token']) {
      try { token = fs.readFileSync(p, 'utf8').trim(); if (token) break; } catch (_) {}
    }
  }
}
if (!token) {
  console.error('Please set TELEGRAM_BOT_TOKEN env var or create /root/.tg-bot-token (chmod 600) containing only the token.');
  process.exit(1);
}

const bot = new Telegraf(token);

// Prefer localhost when running on the droplet itself (avoids nginx basic-auth hop + TLS issues)
const defaultSite = (process.env.HOSTNAME && process.env.HOSTNAME.includes('theforge')) || process.env.THE_MAT_VAULT_PATH === '/opt/vault'
  ? 'http://localhost:3000'
  : 'http://rockinjracing.com';
const SITE_URL = process.env.SITE_URL || defaultSite;
const AUTH = process.env.SITE_BASIC_AUTH || 'user:pass';

const authHeader = 'Basic ' + Buffer.from(AUTH).toString('base64');

console.log('Telegram Hermes bot started. Listening...');

// Prepend specific instructions for the BJJ domain factory
// Note: We send the raw user text only. The grok-chat route handles vault context, 
// intent detection (list/guard/polish/etc), search, and direct applies. No LLM prefix needed.
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  try {
    const isLocal = SITE_URL.includes('localhost') || SITE_URL.includes('127.0.0.1');
    const res = await axios.post(`${SITE_URL}/api/forge/grok-chat`, {
      message: text,
      context: {
        isTechniquePage: /card|technique|gb1/i.test(text),
      }
    }, {
      headers: {
        ...(isLocal ? {} : { 'Authorization': authHeader }),
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
