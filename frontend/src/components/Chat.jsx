import { useEffect, useState, useRef } from 'react';
import '../styles/Chat.css';

function Chat({ closeChat, friend }) {
  const [friendInfo, setFriendInfo] = useState({});
  const [newMessage, setNewMessage] = useState(false);
  const [chatMessages, setChatMessages] = useState(null);
  const [error, setError] = useState(null);

  const messageRef = useRef();

  useEffect(() => {
    fetch("http://localhost:3000/api/friend", {
      method: "post",
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        friend_id: friend,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        setFriendInfo(res.friend);
      })
      .catch((err) => setError(err));
  }, [friend]);

  useEffect(() => {
    if (newMessage) {
      setNewMessage(false);
    } else {
      fetch("http://localhost:3000/api/chat", {
        method: "post",
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          friend_id: friend,
        }),
      })
        .then((res) => res.json())
        .then((res) => {
          setChatMessages(res.messages);
        })
        .catch((err) => setError(err));
    }
  }, [friend, newMessage]);

  const submitMessage = async (e) => {
    e.preventDefault();

    const message = messageRef.current.value;
    
    try {
      const reqResponse = await fetch("http://localhost:3000/api/message", {
        method: "post",
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          friend_id: friend,
        }),
      });
      const response = await reqResponse.json();
      if (response.errors) {
        alert("Error when submitting message: " + response.errors[0].msg);
      } else {
        messageRef.current.value = "";
        setNewMessage(true);
      }
    } catch(err) {
      alert("Connection error detected: " + err);
    }
  }

  if (error) return (
    <div className='chat'>
      <div className='chatHeader'>
        <button className='closeChat' onClick={closeChat}>Close</button>
        <h2>A network error was encountered</h2>
      </div>
    </div>
  );

  return (
    <div className='chat'>
        <div className='chatHeader'>
            <button className='closeChat' onClick={closeChat}>Close</button>
            {friendInfo && (
              <h2>{friendInfo.username}</h2>
            )}
        </div>
        
        <div className='chatMessages'>
          {chatMessages && (
            chatMessages.map((message) => {
              if (message.user == friend) {
                return (
                  <div className='friendMessage' key={message._id}>
                    <p>{message.text}</p>
                  </div>
                );
              } else {
                return (
                  <div className='userMessage' key={message._id}>
                    <p>{message.text}</p>
                  </div>
                );
              }
            })
          )}
        </div>
        
        <div className='sendMessage'>
          <form onSubmit={(e) => submitMessage(e)}>
            <label htmlFor="messageInput" className='messageInputLabel'>Send a message: </label>
            <input type="text" name='messageInput' className='messageInput' ref={messageRef} required />
            <button type='submit' className='sendMessageButton'>Send</button>
          </form>
        </div>
    </div>
  );
}

export default Chat
