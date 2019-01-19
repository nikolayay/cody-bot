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

      // populate the api header
      api.defaults.headers.common["Authorization"] = `Bearer ${
        ctx.session.token
      }`;

      return next();
    } else {
      // authenticate if fails
      ctx.scene.enter("authenticate");
    }
  });

  if (ctx.session.token) {
    console.log("akkwing login llol");
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

bot.command("stats", async ctx => {
  // call api
  const res = await api.get("users/current/stats/last_7_days");
  const { data } = res.data;

  // format a preytty response
  const dailyAverageTime = `${data.human_readable_daily_average} ${
    data.human_readable_daily_average[0] >= 2 ? "👍" : "🛑"
  }`;
  const totalTime = `${data.human_readable_total} ${
    data.human_readable_daily_average[0] >= 8 ? "🔥" : "💩"
  }`;

  const projects = data.projects
    .slice(0, 3)
    .map(p => `* ${p.name}, (${p.text})`)
    .join("\n");

  const languages = data.languages
    .slice(0, 3)
    .map(l => `* ${l.name}`)
    .join("\n");

  // send the response
  ctx.replyWithHTML(
    `Good Morning 🌅 Your latest coding stats are:\n\n<b>Daily average:</b> ${dailyAverageTime}\n\n<b>7-day total:</b> ${totalTime}\n\n<b>Top-3 Projects:</b>\n${projects}\n\n<b>Top-3 Languages:</b>\n${languages}`
  );
});

module.exports = bot;
