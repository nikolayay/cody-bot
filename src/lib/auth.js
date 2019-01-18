// Credentials
const credentials = {
  client: {
    id: "U7U0H0CcMkqsfyb9GW1OJ8lS",
    secret:
      "sec_4no1vwTuIvXbbxJfC2mZy5yRXf26QtA3v7PY12WhdTiwEOkqfBQtf5OJSrG42rGDoNPr3X2RygKNpN6p"
  },
  auth: {
    tokenHost: "https://wakatime.com"
  },
  options: {
    authorizationMethod: "body"
  }
};
const scope = "email, read_stats, read_logged_time";
const redirect_uri = "https://wakatime.com/oauth/test";

// Create auth object
const oauth2 = require("simple-oauth2").create(credentials);
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri,
  scope // also can be an array of multiple scopes, ex. ['<scope1>, '<scope2>', '...']
});

function Auth(oauth2, authorizationUri) {
  this.oauth2 = oauth2;
  this.authorizationUri = authorizationUri;
  this.tokenConfig = function(code) {
    return {
      code,
      redirect_uri,
      scope
    };
  };
}

var auth = new Auth(oauth2, authorizationUri);

module.exports = auth;
