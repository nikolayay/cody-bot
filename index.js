const { Composer, log, session } = require("micro-bot");
const Markup = require("telegraf/markup");
const Extra = require("telegraf/extra");
const ClientOAuth2 = require("client-oauth2");
const axios = require("axios");
const express = require("express");

const service = new ClientOAuth2({
  clientId: "U7U0H0CcMkqsfyb9GW1OJ8lS",
  clientSecret:
    "sec_4no1vwTuIvXbbxJfC2mZy5yRXf26QtA3v7PY12WhdTiwEOkqfBQtf5OJSrG42rGDoNPr3X2RygKNpN6p",
  accessTokenUri: "https://wakatime.com/oauth/token",
  authorizationUri: "https://wakatime.com/oauth/authorize",
  redirectUri: "https://wakatime.com/oauth/test",
  scopes: "email, read_stats"
});

const bot = new Composer();

bot.use((ctx, next) => {
  ctx.reply(ctx.contextState);
  next();
});

bot.use(log());
bot.use(session());

bot.start(({ reply }) => reply("Welcome"));
bot.help(({ reply }) => reply("Help message"));
bot.settings(({ reply }) => reply("Bot settings"));

const keyboard = Markup.inlineKeyboard([
  Markup.urlButton("Authorize 🔒", service.code.getUri())
]);

// connection flow
bot.command("authorize", ctx => {
  const msg =
    "Please authorise Cody with WakaTime, you have to be logged in. Run /connect when you get the code.";
  ctx.telegram.sendMessage(ctx.from.id, msg, Extra.markup(keyboard));
});

bot.command("date", ({ reply }) => reply(`Server time: ${Date()}`));

module.exports = bot;
