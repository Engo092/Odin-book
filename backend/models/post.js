const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const PostSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    date: { type: Date, default: Date.now, required: true },
    likes: { type: Number, default: 0, required: true},
    messages: { type: [{ type: Schema.Types.ObjectId, ref: "Message" }], },
});

PostSchema.virtual('formatted_date').get(function() {
    return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATETIME_SHORT);
});

PostSchema.set('toObject', { virtuals: true });
PostSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Post", PostSchema);