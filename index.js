const { Composer, log, session } = require("micro-bot");
const Stage = require("telegraf/stage");
const { leave } = Stage;
const User = require("./src/db");

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
  const telegramID = ctx.message.from.id;
  User.findOne({ telegramID }, (err, user) => {
    if (user) {
      ctx.session.token = user.token;
    } else {
      // authenticate if fails
      ctx.scene.enter("authenticate");
    }
  });

  if (ctx.session.token) {
    // Update API object
    api.defaults.headers.common["Authorization"] = `Bearer ${
      ctx.session.token
    }`;
    return next();
  }
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
