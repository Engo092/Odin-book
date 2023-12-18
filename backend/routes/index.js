const express = require('express');
const router = express.Router();

const user_controller = require('../controllers/userController');
const message_controller = require('../controllers/messageController');
const post_controller = require('../controllers/postController');
const friend_request_controller = require('../controllers/friendRequestController');
const passport = require('passport');

router.get('/', user_controller.user_index_get);

router.get('/main', post_controller.start_page_get);

router.get('/signup', user_controller.user_signup_get);

router.post('/signup', user_controller.user_signup_post);

router.get('/login', user_controller.user_login_get);

router.post('/login', user_controller.user_login_post);

router.get('/login/success', user_controller.user_login_success);

router.get('/login/failure', user_controller.user_login_failure);

router.get('/logout', user_controller.user_logout_get);

router.get('/friendrequest/:id', friend_request_controller.friend_request_get);

router.post('/friendrequest/:id', friend_request_controller.friend_request_post);

router.get('/friendrequest/remove/:id', friend_request_controller.friend_request_cancel_get);

router.get('/friendrequest/accept/:id', friend_request_controller.friend_request_accept_get);

router.get('/profile/:id', user_controller.user_info_get);

router.post('/friend/remove/:id', user_controller.user_remove_friend_post);

router.post('/post', post_controller.post_submit_post);

router.post('/post/like/:id', post_controller.post_like_post);

router.post('/post/unlike/:id', post_controller.post_unlike_post);

router.post('/message', message_controller.message_submit_post);

router.get('/login/facebook', passport.authenticate('facebook', {scope: ['email']}));

router.get('/oauth2/redirect/facebook',
    passport.authenticate('facebook', { failureRedirect: 'http://localhost:5173/login', failureMessage: true }),
    function(req, res) {
        res.redirect('http://localhost:5173');
    }
);

module.exports = router;
