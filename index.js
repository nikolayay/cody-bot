const { Composer, log, session } = require("micro-bot");
const Stage = require("telegraf/stage");
const schedule = require("node-schedule");
const { leave } = Stage;

const { User, Summary } = require("./src/db");
const api = require("./src/api");
const authenticate = require("./src/stages/authenticate");

const bot = new Composer();
bot.init = async mBot => {
  bot.telegram = mBot.telegram;
};

// other middleware
bot.use(log());
bot.use(session());

// Create scene manager
const stage = new Stage();
stage.command("cancel", leave());

// stage middleware
bot.use(stage.middleware());

// Scene registration
stage.register(authenticate);

// auth middleware
bot.use((ctx, next) => {
  const telegramID = ctx.message.from.id;

  if (ctx.session.token) {
    console.log("already has token in session");
    // Update API object
    api.defaults.headers.common["Authorization"] = `Bearer ${
      ctx.session.token
    }`;
    return next();
  } else {
    console.log("no has token in session");
    User.findOne({ telegramID }, (err, user) => {
      if (user) {
        ctx.session.token = user.token;

        // populate the api header
        api.defaults.headers.common["Authorization"] = `Bearer ${
          ctx.session.token
        }`;

        return next();
      } else {
        console.log("proceed to auth flow");
        // authenticate if fails
        ctx.scene.enter("authenticate");
      }
    });
  }
});

bot.start(ctx => ctx.scene.enter("authenticate"));

// CRON - every monday at 8am
schedule.scheduleJob("* * * * *", function() {
  User.find({}, (err, data) => {
    data.map(async ({ telegramID, token }) => {
      // reset the token
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // call api
      const res = await api
        .get("users/current/stats/last_7_days")
        .catch(err => bot.telegram.sendMessage(telegramID, err.message));
      const { data } = res.data;

      // save last week`s summary to db
      const sum = new Summary({
        telegramID,
        data,
        createdAt: new Date()
      });

      sum.save(function(err) {
        if (err) {
          return next(err);
        }
        console.log("SUMMARY CREATED");
      });

      // format a preytty response
      const dailyAverageTime = `${data.human_readable_daily_average} ${
        data.human_readable_daily_average[0] >= 2 ? "👍" : "🛑"
      }`;
      const totalTime = `${data.human_readable_total} ${
        data.human_readable_total[0] >= 8 ? "🔥" : "💩"
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
      bot.telegram.sendMessage(
        telegramID,
        `Good Morning 🌅 Your last week's coding stats are:\n\n<b>Daily average:</b> ${dailyAverageTime}\n\n<b>7-day total:</b> ${totalTime}\n\n<b>Top-3 Projects:</b>\n${projects}\n\n<b>Top-3 Languages:</b>\n${languages}`,
        { parse_mode: "HTML" }
      );
    });
  });
});

module.exports = bot;
