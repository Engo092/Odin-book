import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ErrorList from './ErrorList'
import '../styles/Signup.css'

function Signup() {
  const [signupErrors, setSignupErrors] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3000/api/signup", { credentials: 'include' })
      .then((res) => res.json())
      .then((res) => {
        if (res.isAuthenticated === true) {
          navigate("/");
        }
      });
  }, []);

  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
    
  const handleSubmit = async (e) => {
    e.preventDefault();

    const firstName = firstNameRef.current.value;
    const lastName = lastNameRef.current.value;
    const email = emailRef.current.value;
    const password= passwordRef.current.value;

    try {
      const reqResponse = await fetch("http://localhost:3000/api/signup", {
        method: "post",
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: firstName,
          lastName: lastName,
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
        setSignupErrors(errorArray);
      } else {
        setSignupErrors([]);
        if (response.messages) {
          // means there are authentication errors
          const errorArray = [];
          response.messages.forEach(function(err) {
            errorArray.push(err);
          });
          setSignupErrors(errorArray);
        } else {
          navigate("/login");
        }
      }
    } catch(err) {
      alert("Connection Error detected: " + err);
    }
  }

  return (
    <>
      <header className='alternateHeader'>
        <h1>Odin Book</h1>
      </header>
      <section>
        <div className="signupContent">
          <h2>Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">First Name:</label>
            <input type="text" name="firstName" placeholder='First Name' ref={firstNameRef} required />
            <label htmlFor="username">Last Name:</label>
            <input type="text" name="lastName" placeholder='Last Name' ref={lastNameRef} required />
            <label htmlFor="email">E-mail:</label>
            <input type="email" name="email" placeholder='E-mail' ref={emailRef} required />
            <label htmlFor="password">Password (min: 6 characters):</label>
            <input type="password" name="password" placeholder='Password' ref={passwordRef} minLength='6' required />

            <button type='submit' className='signupSubmit'>Sign Up</button>
          </form>
          <p className='login'>Already have an account? <Link to="/login">Log In</Link></p>
          {signupErrors.length > 0 ? (
            <ErrorList errList={signupErrors} />
          ) : ''}
        </div>
      </section>
    </>
  );
}

export default Signup
