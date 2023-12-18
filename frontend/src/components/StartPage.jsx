import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/StartPage.css';
import plusSymbol from '../assets/svgs/plus.svg';
import thumbsUp from '../assets/svgs/thumbs-up.svg';
import send from '../assets/svgs/send.svg';

function StartPage() {
    const [error, setError] = useState(null);
    const [serverResponse, setServerResponse] = useState(null);
    const [mustUpdate, setMustUpdate] = useState(false);

    useEffect(() => {
        if (mustUpdate) {
            setMustUpdate(false);
        } else {
            fetch('http://localhost:3000/api/main', {
                credentials: 'include',
            })
                .then((res) => res.json())
                .then((res) => {
                    setServerResponse(res);
                })
                .catch((err) => setError(err));
        }
    }, [mustUpdate]);

    const navigate = useNavigate();

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        try {
            const reqResponse = await fetch('http://localhost:3000/api/message', {
                method: "post",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    comment: e.target[0].value,
                    post: e.target.id,
                }),
            });
            const response = await reqResponse.json();
            if (response.errors) {
                const errorArray = [];
                response.errors.forEach(function(error) {
                    if (!errorArray.includes(error.msg)) {
                        errorArray.push(error.msg);
                    }
                });
                alert("Error when submitting comment: " + errorArray);
            } else {
                e.target[0].value = '';
                setMustUpdate(true);
            }
        } catch(err) {
            alert("Connection error detected: " + err);
        }
    }

    const goToNewPost = () => {
        navigate('/post');
    }

    const likePost = async (id) => {
        try {
            const reqResponse = await fetch(`http://localhost:3000/api/post/like/${id}`, {
                method: "post",
                credentials: 'include',
            });
            const response = await reqResponse.json();
            setMustUpdate(true);
        } catch(err) {
            alert("Connection error detected: " + err);
        }
    }
    
    const unlikePost = async (id) => {
        try {
            const reqResponse = await fetch(`http://localhost:3000/api/post/unlike/${id}`, {
                method: "post",
                credentials: 'include',
            });
            const response = await reqResponse.json();
            setMustUpdate(true);
        } catch(err) {
            alert("Connection error detected: " + err);
        }
    }

    if (error) return (
        <div className='errorContent'>
            <h2>A network error was encountered</h2>
        </div>
    );

    return (
        <div className='startPage'>
            <div className='createStory'>
                <button onClick={goToNewPost} className='createStoryButton'>
                    <img src={plusSymbol} alt="Add" />
                </button>
                <div className='createStoryText'>
                    <h3>Create Story</h3>
                    <p>Share a photo or write something.</p>
                </div>
            </div>

            {serverResponse && serverResponse.posts && (
                serverResponse.posts.map(post => {
                    return (
                        <div className='postDisplay' key={post._id}>
                            <div className='authorAndDate'>
                                <div className='postpfp'><img src={post.user.picture} alt="" /></div>
                                <h4><Link to={`/profile/${post.user._id}`} className='userLink'>{post.user.firstName} {post.user.lastName}</Link></h4>
                                <p>at {post.formatted_date}</p>
                            </div>
                            <div className='postContentDisplay'>
                                {post.content}
                            </div>
                            <div className='postLikesDisplay'>
                                <img src={thumbsUp} alt="likes" />
                                <span className='likedNumber'>{post.likes}</span>
                                {serverResponse.user.likedPosts.includes(post._id) && (
                                    <span className='likedOrNot'>liked by you</span>
                                )}
                            </div>
                            {serverResponse.user.likedPosts.includes(post._id) ? (
                                <button className='likeButton' onClick={() => unlikePost(post._id)}>Unlike</button>
                            ) : (
                                <button className='likeButton' onClick={() => likePost(post._id)}>Like</button>
                            )}
                            <form onSubmit={handleCommentSubmit} className='commentForm' id={post._id}>
                                <label htmlFor="comment" className='commentLabel'>Comment on this post:</label>
                                <div className='inputAndSubmit'>
                                    <input type="text" name='comment' className='commentInput' placeholder='Comment' required />
                                    <button type='submit' className='submitComment'><img src={send} alt="send" /></button>
                                </div>
                            </form>
                            {post.messages.length < 1 ? (
                                <div className='noCommentsYet'>There are no comments here yet, be the first!</div>
                            ) : (
                                <div className='commentList'>
                                    {post.messages.map(message => {
                                        return (
                                            <div className='comment' key={message._id}>
                                                <div className='commentpfp'><img src={message.user.picture} alt="" /></div>
                                                <div className='commentContent'>
                                                    <div className='authorAndDate'>
                                                        <Link to={`/profile/${message.user._id}`} className='userLink'>{message.user.firstName} {message.user.lastName}</Link>
                                                        <p> {message.formatted_date}</p>
                                                    </div>
                                                    <p>{message.text}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })
            )}
        </div>
    );
}

export default StartPage



// TODO: finish the like and comment functions, similar to the profile page