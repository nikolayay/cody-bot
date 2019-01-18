const auth = require("../lib/auth");
const api = require("../api");

const Scene = require("telegraf/scenes/base");

// Auth scene
const authenticate = new Scene("authenticate");
authenticate.enter(ctx =>
  ctx.reply(
    `Welcome! Register by following the link. Paste the code in the response. ${
      auth.authorizationUri
    }`
  )
);
authenticate.leave(ctx => ctx.reply("Authenticated sucessfully!"));
authenticate.hears(/sec_[A-Za-z0-9\-\._~\+\/]+=*/gm, async ctx => {
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
authenticate.on("message", ctx =>
  ctx.reply("Incorrect code. Paste the code in the response.")
);

module.exports = authenticate;
