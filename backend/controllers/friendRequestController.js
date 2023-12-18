const FriendRequest = require('../models/friendRequest');
const User = require('../models/user');

const asyncHandler = require('express-async-handler');

exports.friend_request_get = asyncHandler(async (req, res, next) => {    
    if (req.params.id == req.user._id) {
        get_own_list(req, res, next);
    } else {
        get_other_user_list(req, res, next);
    }
});

exports.friend_request_post = asyncHandler(async (req, res, next) => {
    const checkIfExists = await FriendRequest.findOne({fromUser: req.user._id, toUser: req.params.id}).exec();
    const checkIfExists2 = await FriendRequest.findOne({fromUser: req.params.id, toUser: req.user._id}).exec();

    if (checkIfExists || checkIfExists2) {
        res.json({message: "request already exists"});
    } else {
        const friendRequest = new FriendRequest({
            fromUser: req.user._id,
            toUser: req.params.id,
        });
    
        await friendRequest.save();
        res.json({message: "friend request sent"});
    } 
});

exports.friend_request_cancel_get = asyncHandler(async (req, res, next) => {
    await FriendRequest.findOneAndDelete({_id: req.params.id}).exec();
    res.json({message: "friend request removed"});
})

exports.friend_request_accept_get = asyncHandler(async (req, res, next) => {
    // must check if friend request exists, and them remove it while adding both users as each other's friends
    const reqObject = await FriendRequest.findById(req.params.id).exec();
    if (reqObject) {
        await User.findOneAndUpdate({_id: reqObject.fromUser._id}, {$push: { friends: reqObject.toUser._id }}).exec();
        await User.findOneAndUpdate({_id: reqObject.toUser._id}, {$push: { friends: reqObject.fromUser._id }}).exec();
        await FriendRequest.findOneAndDelete({_id: req.params.id}).exec();
        res.json({message: "friend added"});
    } else {
        res.json({message: "couldn't add friend"});
    }
})


const get_own_list = asyncHandler(async (req, res, next) => {
    // Gets info about requests received, requests sent, friends, and all other users
    const reqSent = await FriendRequest.find({ fromUser: req.user._id }).populate("toUser", {firstName: 1, lastName: 1, picture: 1}).exec();
    const reqReceived = await FriendRequest.find({ toUser: req.user._id }).populate("fromUser", {firstName: 1, lastName: 1, picture: 1}).exec();
    const user = await User.findById(req.user._id).populate("friends", {firstName: 1, lastName: 1, picture: 1}).exec();

    const excludedUsers = join_all_ids(reqSent, reqReceived, user);
    const allUsers = await User.find({ "_id": { $nin: excludedUsers } }, {firstName: 1, lastName: 1, picture: 1}).exec();
    res.json({
        otherUser: false,
        requests_sent: reqSent,
        requests_received: reqReceived,
        friends: user.friends,
        all_users: allUsers,
    });
});

const get_other_user_list = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id).populate("friends", {firstName: 1, lastName: 1, picture: 1}).exec();
    res.json({
        otherUser: true,
        friends: user.friends,
        myId: req.user._id,
    });
});

const join_all_ids = (reqSent, reqReceived, user) => {
    const joined = [user._id];
    reqSent.forEach(req => {
       joined.push(req.toUser._id); 
    });
    reqReceived.forEach(req => {
        joined.push(req.fromUser._id);
    });
    user.friends.forEach(friend => {
        joined.push(friend._id);
    });
    return joined;
}