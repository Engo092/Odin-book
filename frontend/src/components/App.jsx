import { useNavigate, Outlet, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import '../styles/App.css';
import group from '../assets/svgs/group.svg';

function App() {
  const [error, setError] = useState(null);
  const [serverResponse, setServerResponse] = useState(null);
  const [shouldUpdate, setShouldUpdate] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (shouldUpdate) {
      setShouldUpdate(false);
    } else {
      fetch("http://localhost:3000/api", {
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((res) => {
          if (!res.isAuthenticated) {
            navigate('/login');
          } else {
            setServerResponse(res);
          }
        })
        .catch((err) => setError(err));
    }
  }, [shouldUpdate]);

  if (error) return (
    <div className='mainContent'>
      <h2>A network error was encountered</h2>
    </div>
  );

  return (
    <>
      <header>
        <h1><Link to="/">Odin Book </Link></h1>
        {serverResponse && (
          <div className='headerStuff'>
            <Link to={`/friends/${serverResponse.user._id}`}><img src={group} alt="friendlist" className='friendListIcon' /></Link>
            <Link to={`/profile/${serverResponse.user._id}`}><div className='profilePicture'><img src={serverResponse.user.picture} alt="" /></div></Link>
          </div>
        )}
      </header>
      {serverResponse && (
        <div className='mainContent'>
          <Outlet context={{ serverResponse: serverResponse }} />
        </div>
      )}
    </>
  );
}

export default App
