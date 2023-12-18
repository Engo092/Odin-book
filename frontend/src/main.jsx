import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './components/App.jsx'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import StartPage from './components/StartPage.jsx'
import FriendList from './components/FriendList.jsx'
import Profile from './components/Profile.jsx'
import NewPost from './components/NewPost.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <StartPage />,
      },
      {
        path: "/profile/:profileid",
        element: <Profile />,
      },
      {
        path: "/friends/:profileid",
        element: <FriendList />,
      },
      {
        path: "/post",
        element: <NewPost />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
