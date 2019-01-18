const { Composer, log, session } = require("micro-bot");
const Stage = require("telegraf/stage");
const { leave } = Stage;

const api = require("./src/api");
const authenticate = require("./src/stages/authenticate");

const bot = new Composer();

bot.use(log());
bot.use(session());

// Create scene manager
const stage = new Stage();
stage.command("cancel", leave());

bot.use(stage.middleware());

// auth middleware
bot.use((ctx, next) => {
  if (ctx.session.token) {
    return next();
  }
  // attempt to get from database

  // authenticate if fails
  ctx.scene.enter("authenticate");
});
// Scene registration
stage.register(authenticate);

bot.start(ctx => ctx.scene.enter("authenticate"));
bot.command("projects", async ctx => {
  ctx.reply("Fetching your projects!");
  const res = await api.get("users/current/projects");
  ctx.reply(res.data);
});

module.exports = bot;
