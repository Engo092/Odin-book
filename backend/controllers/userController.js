const User = require('../models/user');
const FriendRequest = require('../models/friendRequest');

const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const passport = require('passport');


exports.user_index_get = asyncHandler(async (req, res, next) => {
    if (!req.user) {
        res.json({
            isAuthenticated: false,
        });
    } else {
        res.json({
            isAuthenticated: true,
            user: req.user,
        });    
    }
});

exports.user_signup_get = asyncHandler(async (req, res, next) => {
    // clears any login error messages
    if (req.session.messages) {
        req.session.messages = null;
    }
    if (!req.user) {
        res.json({
            isAuthenticated: false,
        });
    } else {
        res.json({
            isAuthenticated: true,
        });
    }
});

exports.user_signup_post = [
    // validate and sanitize fields
    body("firstName", "first name must not be empty").trim().isLength({ min: 1 }).escape(),
    body("lastName", "last name must not be empty").trim().isLength({ min: 1 }).escape(),
    body("password", "please provide a valid password").trim().isLength({ min: 6 }).escape(),
    body("email")
        .trim()
        .isLength({ min: 1 })
        .withMessage("email must be specified")
        .isEmail()
        .withMessage("please provide a valid email")
        .custom(async value => {
            const user = await User.findOne({ email: value });
            if (user) {
                throw new Error("email already in use");
            }
        })
        .escape(),

    async (req, res, next) => {
        try {
            bcrypt.hash(req.body.password, 10 , async (err, hashedPassword) => {
                if (err) {
                    return next(err);
                } else {
                    const errors = validationResult(req);

                    const user = new User({
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        password: hashedPassword,
                        email: req.body.email,
                    });

                    if (!errors.isEmpty()) {
                        res.json({ errors: errors.array() });
                        return;
                    } else {
                        await user.save();
                        res.json({ message: "signup OK, please log in now" });
                    }
                }
            });
        } catch(err) {
            return next(err);
        }
    }
];

exports.user_login_get = asyncHandler(async (req, res, next) => {
    // clears any login error messages
    if (req.session.messages) {
        req.session.messages = null;
    }
    if (!req.user) {
        res.json({
            isAuthenticated: false,
        });
    } else {
        res.json({
            isAuthenticated: true,
        });
    }
});

exports.user_login_post = [
    body("email")
        .trim()
        .isLength({ min: 1 })
        .withMessage("email must be specified")
        .isEmail()
        .withMessage("please provide a valid email")
        .escape(),
    body("password", "please provide a valid password (minimum: 6 characters)").trim().isLength({ min: 6 }).escape(),

    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({ errors: errors.array() });
            return;
        } else {
            // clears any previous login error messages
            if (req.session.messages) {
                req.session.messages = null;
            }
            
            passport.authenticate("local", {
                successRedirect: "/api/login/success",
                failureRedirect: "/api/login/failure",
                failureMessage: true,
            })(req, res, next);
        }
    })
];

exports.user_login_success = asyncHandler(async (req, res, next) => {
    if (req.user) {
        res.json({ message: "login OK", account: `logged in as ${req.user.username}` });
    } else {
        res.redirect("/api/login");
    }
});

exports.user_login_failure = asyncHandler(async (req, res, next) => {
    res.json(req.session);
});

exports.user_logout_get = asyncHandler(async (req, res, next) => {
    req.logout((err) => {
        if (err) {
            next(err);
        }
    });
    res.json({message: "logged out"});
});

exports.user_info_get = asyncHandler(async (req, res, next) => {
    // Complex query, but it queries for information about the user profile, populates and sorts the posts according to date,
    // and populates and sorts each posts's comments according to date as well, retrieving the name of each comment's author
    const userInfo = await User.findById(req.params.id, {password: 0, friends: 0, email: 0, facebookId: 0})
        .populate({path: "posts", populate: {path: "messages", populate: {path: "user", select: {'firstName': 1, 'lastName': 1, 'picture': 1}}, options: {sort: {_id: 1}}}, options: {sort: {_id: -1}}}).exec();

    if (req.params.id == req.user._id) {
        res.json({profile: userInfo, otherUser: false, likedPosts: userInfo.likedPosts});
    } else {
        // look if there is a friend request between them or if they are already friends
        const user = await User.findById(req.user._id).exec();
        let isFriends = false;
        user.friends.forEach(friend => {
            if (req.params.id == friend) {
                isFriends = true;
            }
        });
        if (isFriends) {
            res.json({profile: userInfo, otherUser: true, isFriends: isFriends, likedPosts: user.likedPosts});
        } else {
            // check if there is friend request between both users
            const requestFrom = await FriendRequest.findOne({fromUser: user._id, toUser: userInfo._id}).exec();
            if (requestFrom) {
                res.json({profile: userInfo, otherUser: true, fromUser: requestFrom._id, likedPosts: user.likedPosts});
            } else {
                const requestTo = await FriendRequest.findOne({fromUser: userInfo._id, toUser: user._id}).exec();
                if (requestTo) {
                    res.json({profile: userInfo, otherUser: true, toUser: requestTo._id, likedPosts: user.likedPosts});
                }
                else {
                    res.json({profile: userInfo, otherUser: true, likedPosts: user.likedPosts});
                }
            }
        }
    }
});

exports.user_remove_friend_post = asyncHandler(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user._id, { $pull: { "friends": req.params.id } }).exec();
    await User.findByIdAndUpdate(req.params.id, { $pull: { "friends": req.user._id } }).exec();
    res.json({message: "friend removed"});
});