import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import '../styles/Login.css';
import ErrorList from './ErrorList';

function App() {
  const [loginErrors, setLoginErrors] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/api/login", { credentials: 'include' })
      .then((res) => res.json())
      .then((res) => {
        if (res.isAuthenticated === true) {
          navigate("/");
        }
      });
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    const email = emailRef.current.value;
    const password= passwordRef.current.value;
    
    try {
      const reqResponse = await fetch("http://localhost:3000/api/login", {
        method: "post",
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
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
        setLoginErrors(errorArray);
      } else {
        setLoginErrors([]);
        if (response.messages) {
          // means there are authentication errors
          const errorArray = [];
          response.messages.forEach(function(err) {
            errorArray.push(err);
          });
          setLoginErrors(errorArray);
        } else {
          navigate("/");
        }
      }
    } catch(err) {
      alert("Connection Error detected: " + err);
    }
  }

  const emailRef = useRef();
  const passwordRef = useRef();

  return (
    <>
      <header className='alternateHeader'>
        <h1>Odin Book</h1>
      </header>
      <section>
        <div className="loginContent">
          <h2>Log In</h2>
          <form onSubmit={submitHandler}>
            <label htmlFor="email">E-mail:</label>
            <input type="email" name="email" placeholder='E-mail' ref={emailRef} required />
            <label htmlFor="password">Password:</label>
            <input type="password" name="password" placeholder='Password' minLength='6' ref={passwordRef} required />

            <button type='submit' className='loginSubmit'>Log In</button>
          </form>
          <p className='signup'>Don't have an account? <Link to="/signup">Sign Up</Link></p>
          <a href='http://localhost:3000/api/login/facebook' className='facebookLogin'>Log In With Facebook</a>

          {loginErrors.length > 0 ? (
            <ErrorList errList={loginErrors} />
          ) : ''}
        </div>
      </section>
    </>
  );
}

export default App
