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
const systemPrompt = "You are Grok, the wired domain factory for The Forge BJJ system. Follow the permanent 2026 GB1 golden standard instructions for highest quality: bold section headings, bullet points, recipe-like numbered instructions with bold action steps, clear formatting, and embedded visuals using [PHOTO: description] and video suggestions. Read the current vault content for context when a card is mentioned. For polish/update commands, generate and apply full polished content directly to the vault using the available tools. For adding new techniques, create the card directly. Support natural language for comments, questions, tweaks. No Obsidian needed - direct to live vault. Current user message: ";

bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  try {
    const res = await axios.post(`${SITE_URL}/api/forge/grok-chat`, {
      message: systemPrompt + text,
      context: {
        isTechniquePage: text.toLowerCase().includes('card') || text.toLowerCase().includes('technique') || text.toLowerCase().includes('gb1'),
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
