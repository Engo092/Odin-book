const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String },
    email: { type: String, required: true, unique: true },
    friends: { type: [{ type: Schema.Types.ObjectId, ref: "User" }], },
    posts: { type: [{ type: Schema.Types.ObjectId, ref: "Post" }], },
    likedPosts: { type: [{ type: Schema.Types.ObjectId, ref: "Post" }], },
    facebookId: { type: String },
    picture: { type: String, default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png' },
});

module.exports = mongoose.model("User", UserSchema);