import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/FriendList.css';

function FriendList() {
    const profileId = useParams();

    const [error, setError] = useState(null);
    const [serverResponse, setServerResponse] = useState(null);
    const [mustUpdate, setMustUpdate] = useState(false);

    useEffect(() => {
        if (mustUpdate) {
            setMustUpdate(false);
        } else {
            fetch(`http://localhost:3000/api/friendrequest/${profileId.profileid}`, {
                credentials: 'include',
            })
                .then((res) => res.json())
                .then((res) => {
                    setServerResponse(res);
                })
                .catch((err) => setError(err));
        }
    }, [mustUpdate, profileId]);

    const sendFriendRequest = async (id) => {
        try {
            const reqResponse = await fetch(`http://localhost:3000/api/friendrequest/${id}`, {
                method: "post",
                credentials: 'include',
            });
            const response = await reqResponse.json();
            setMustUpdate(true);
        } catch(err) {
            alert("Connection error detected: " + err);
        }
    }

    const cancelFriendRequest = async (id) => {
        try {
            const reqResponse = await fetch(`http://localhost:3000/api/friendrequest/remove/${id}`, {
                credentials: 'include',
            });
            const response = await reqResponse.json();
            setMustUpdate(true);
        } catch(err) {
            alert("Connection error detected: " + err);
        }
    }

    const acceptFriendRequest = async (id) => {
        try {
            const reqResponse = await fetch(`http://localhost:3000/api/friendrequest/accept/${id}`, {
                credentials: 'include',
            });
            const response = await reqResponse.json();
            if (response.message === "couldn't add friend") {
                alert("Could not add friend, please try again later");
            }
            setMustUpdate(true);
        } catch(err) {
            alert("Connection error detected: " + err);
        }
    }

    const removeFriend = async (id) => {
        try {
            const reqResponse = await fetch(`http://localhost:3000/api/friend/remove/${id}`, {
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
        <div className='mainContent'>
            <h2>A network error was encountered</h2>
        </div>
    );

    return (
        <>
            {serverResponse && !serverResponse.otherUser && (
                serverResponse.requests_sent.length > 0 && (
                    <div className='pendingRequests'>
                        <h2>Pending Requests:</h2>
                        {serverResponse.requests_sent.map(req => {
                            return (
                                <div className='friendDisplay' key={req._id}>
                                    <div className='profilePicture'><img src={req.toUser.picture} alt="" /></div>
                                    <Link to={`/profile/${req.toUser._id}`}>{req.toUser.firstName} {req.toUser.lastName}</Link>
                                    <button className='removeFriendRequest' onClick={() => cancelFriendRequest(req._id)}>Cancel</button>
                                </div>
                            )
                        })}
                    </div>
                )
            )}

            {serverResponse && !serverResponse.otherUser && (
                serverResponse.requests_received.length > 0 && (
                    <div className='requestsReceived'>
                        <h2>Requests Received:</h2>
                        {serverResponse.requests_received.map(req => {
                            return(
                            <div className='friendDisplay' key={req._id}>
                                <div className='profilePicture'><img src={req.fromUser.picture} alt="" /></div>
                                <Link to={`/profile/${req.fromUser._id}`}>{req.fromUser.firstName} {req.fromUser.lastName}</Link>
                                <button className='acceptFriendRequest' onClick={() => acceptFriendRequest(req._id)}>Accept</button>
                            </div>
                            )
                        })}
                    </div>
                )
            )}

            {serverResponse && (
                serverResponse.otherUser ? (
                    serverResponse.friends.length > 0 ? (
                        <div className='friendList'>
                            <h2>Friend List:</h2>
                            {serverResponse.friends.map(friend => {
                                return (
                                    <div className='friendDisplay' key={friend._id}>
                                        <div className='profilePicture'><img src={friend.picture} alt="" /></div>
                                        <Link to={`/profile/${friend._id}`}>{friend.firstName} {friend.lastName}</Link>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className='friendList'>
                            <h2>Friend List:</h2>
                            <p>No friends found</p>
                        </div>
                    )
                ) : (
                    serverResponse.friends.length > 0 && (
                        <div className='friendList'>
                            <h2>Friend List:</h2>
                            {serverResponse.friends.map(friend => {
                                return (
                                    <div className='friendDisplay' key={friend._id}>
                                        <div className='profilePicture'><img src={friend.picture} alt="" /></div>
                                        <Link to={`/profile/${friend._id}`}>{friend.firstName} {friend.lastName}</Link>
                                        <button className='removeFriend' onClick={() => removeFriend(friend._id)}>Remove</button>
                                    </div>
                                )
                            })}
                        </div>
                    )
                )
            )}

            {serverResponse && !serverResponse.otherUser && (
                serverResponse.all_users.length > 0 && (
                    <div className='allUsers'>
                        <h2>All Users:</h2>
                        {serverResponse.all_users.map(user => {
                            return (
                                <div className='friendDisplay' key={user._id}>
                                    <div className='profilePicture'><img src={user.picture} alt="" /></div>
                                    <Link to={`/profile/${user._id}`}>{user.firstName} {user.lastName}</Link>
                                    <button className='sendFriendRequest' onClick={() => sendFriendRequest(user._id)}>Add Friend</button>
                                </div>
                            );
                        })}
                    </div>
                )
            )}
        </>
    );
}

export default FriendList;