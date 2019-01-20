const mongoose = require("mongoose");

var Schema = mongoose.Schema;

const userSchema = new Schema({
  token: String,
  telegramID: String,
  chatID: String
});

const summarySchema = new Schema({
  telegramID: String,
  data: Object,
  createdAt: Date
});

var User = mongoose.model("User", userSchema);
var Summary = mongoose.model("Summary", summarySchema);

mongoose.connect(
  "mongodb+srv://nikolay:edaadal123@wounds-scars-c2yf8.mongodb.net/botDb?retryWrites=true",
  { useNewUrlParser: true }
);

module.exports = { User, Summary };
