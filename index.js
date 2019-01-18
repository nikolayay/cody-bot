const { Composer, log, session } = require("micro-bot");
const Stage = require("telegraf/stage");
const { leave } = Stage;

const authenticate = require("./src/stages/authenticate");

const bot = new Composer();

bot.use(log());
bot.use(session());

// Create scene manager
const stage = new Stage();
stage.command("cancel", leave());

bot.use(stage.middleware());

// Scene registration
stage.register(authenticate);

bot.start(ctx => ctx.scene.enter("authenticate"));

module.exports = bot;
