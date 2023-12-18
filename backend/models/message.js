const mongoose = require('mongoose');
const { DateTime } = require('luxon');

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    date: { type: Date, default: Date.now, required: true },
});

MessageSchema.virtual('formatted_date').get(function() {
    return DateTime.fromJSDate(this.date).toLocaleString(DateTime.DATETIME_SHORT);
});

MessageSchema.set('toObject', { virtuals: true });
MessageSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model("Message", MessageSchema);