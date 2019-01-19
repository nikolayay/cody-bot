const axios = require("axios");

const api = axios.create({
  baseURL: "https://wakatime.com/api/v1/"
});

async function getStats() {
  const res = await api.get("users/current/stats/last_7_days");
  return res.data;
}

module.exports = api;
