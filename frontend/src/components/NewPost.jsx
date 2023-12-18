import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import '../styles/NewPost.css';
import ErrorList from './ErrorList';

function NewPost() {
  const [postErrors, setPostErrors] = useState([]);

  const navigate = useNavigate();
  const contentRef = useRef(null);

  const createPost = async (e) => {
    e.preventDefault();

    const content = contentRef.current.value;
    
    try {
      const reqResponse = await fetch("http://localhost:3000/api/post", {
        method: "post",
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content,
        }),
      });
      const response = await reqResponse.json()
      if (response.errors) {
        const errorArray = [];
        response.errors.forEach(function(error) {
          if (!errorArray.includes(error.msg)) {
            errorArray.push(error.msg);
          }
        });
        setPostErrors(errorArray);
      } else {
        setPostErrors([]);
        navigate(-1);
      }
    } catch(err) {
      alert("Connection Error detected: " + err);
    }
  }

  return (
    <div className='postCreator'>
      <form onSubmit={createPost} className='postCreatorForm'>
        <legend className='newPostLegend'>Create New Post</legend>
        <label htmlFor="newPostContent">Content:</label>
        <textarea type="text" name='newPostContent' placeholder='Content' ref={contentRef} required />
        <button type='submit' className='newPostButton'>Post</button>
      </form>

      {postErrors.length > 0 ? (
        <ErrorList errList={postErrors} />
      ) : ''}
    </div>
  );
}

export default NewPost
