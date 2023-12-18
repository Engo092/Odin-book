const Message = require('../models/message');
const Post = require('../models/post');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.message_submit_post = [
    body("comment", "please provide a comment").trim().isLength({ min: 1 }),
    
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({ errors: errors.array() });
            return;
        } else {
            const message = new Message({ 
                user: req.user._id,
                text: req.body.comment,
                post: req.body.post,
            });
            await message.save();
            await Post.findByIdAndUpdate(req.body.post, { $push: { messages: message._id } }).exec();
            res.json({status: "message submitted"});
        }
    })
];