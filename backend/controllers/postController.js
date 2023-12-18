const Post = require('../models/post');
const User = require('../models/user');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');

exports.start_page_get = asyncHandler(async (req, res, next) => {
    // Retrieves posts, sort them by date of creation, and populate the post's comments and the comment's author names
    const posts = await Post.find()
        .sort({"_id": -1})
        .populate({path: "user", select: {'firstName': 1, 'lastName': 1, 'picture': 1}})
        .populate({path: "messages", populate: {path: "user", select: {'firstName': 1, 'lastName': 1, 'picture': 1}, options: {sort: {_id: 1}}}}).exec();
    const user = await User.findById(req.user._id).exec();

    res.json({
        user: user,
        posts: posts,
    });    
})

exports.post_submit_post = [
    body("content", "please provide a post content").trim().isLength({ min: 1 }),
    
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({ errors: errors.array() });
            return;
        } else {
            const post = new Post({ 
                user: req.user._id,
                content: req.body.content,
            });
            await post.save();
            await User.findByIdAndUpdate(req.user._id, { $push: { "posts": post._id } }).exec();
            res.json({status: "post submitted"});
        }
    })
];

exports.post_like_post = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).exec();
    let hasLikedAlready = false;
    user.likedPosts.forEach(post => {
        if (post == req.params.id) {
            hasLikedAlready = true;
        }
    });
    if (hasLikedAlready) {
        res.json("post has already been liked");
    } else {
        await Post.findByIdAndUpdate(req.params.id, { $inc: { "likes": 1 }}).exec();
        await User.findByIdAndUpdate(user._id, { $push: { "likedPosts": req.params.id }}).exec();
        res.json("post liked");
    }
});

exports.post_unlike_post = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id).exec();
    let hasUnlikedAlready = true;
    user.likedPosts.forEach(post => {
        if (post == req.params.id) {
            hasUnlikedAlready = false;
        }
    });
    if (hasUnlikedAlready) {
        res.json("post has already been unliked");
    } else {
        await Post.findByIdAndUpdate(req.params.id, { $inc: { "likes": -1 }}).exec();
        await User.findByIdAndUpdate(user._id, { $pull: { "likedPosts": req.params.id }}).exec();
        res.json("post unliked");
    }
});
