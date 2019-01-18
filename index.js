const { Composer, log, session } = require("micro-bot");
const Stage = require("telegraf/stage");
const Scene = require("telegraf/scenes/base");
const { leave } = Stage;
const axios = require("axios");

const api = axios.create({
  baseURL: "https://wakatime.com/api/v1/"
});

const auth = require("./lib/auth");

const bot = new Composer();

bot.use(log());
bot.use(session());

// Greeter scene
const greeter = new Scene("greeter");
greeter.enter(ctx =>
  ctx.reply(
    `Welcome! Register by following the link. Paste the code in the response. ${
      auth.authorizationUri
    }`
  )
);
greeter.leave(ctx => ctx.reply("Authenticated sucessfully!"));
greeter.hears(/sec_[A-Za-z0-9\-\._~\+\/]+=*/gm, async ctx => {
  ctx.reply("Code recieved. Logging you in...");

  // Log the person in here
  const code = ctx.update.message.text;

  try {
    const result = await auth.oauth2.authorizationCode.getToken(
      auth.tokenConfig(code)
    );
    const accessToken = auth.oauth2.accessToken.create(result);
    const token = accessToken.token.access_token;

    // Update API object
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const res = await api.get("users/current/projects");
    ctx.reply(res.data);
  } catch (error) {
    // const msg = error.data.payload.error_description;
    ctx.reply(`Error: ${error}`);
  }
});
greeter.on("message", ctx => ctx.reply("Paste the code in the response."));

// Create scene manager
const stage = new Stage();
stage.command("cancel", leave());

bot.use(stage.middleware());

// Scene registration
stage.register(greeter);

bot.start(ctx => ctx.scene.enter("greeter"));

module.exports = bot;
