const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FriendRequestSchema = new Schema({
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("FriendRequest", FriendRequestSchema);