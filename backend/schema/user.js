const mongoose = require("mongoose");
const user = new mongoose.Schema({
    username: String,
    password: String,
    phone: String,
    taste: String,
    email: String,
    joinedGroups: Array
});

module.exports = mongoose.model("User", user);