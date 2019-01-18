const axios = require("axios");

const api = axios.create({
  baseURL: "https://wakatime.com/api/v1/"
});

module.exports = api;
