import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import LoginPage from '../Pages/LoginPage/LoginPage';
import LomwongPage from '../Pages/LomwongPage/LomwongPage';
import ErrorPage from '../Pages/ErrorPage/ErrorPage';
import LoginDashboard from '../Pages/Dashboard/Dashboard';
import HelpDeskPage from '../Pages/HelpDeskPage/HelpDeskPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/login', element: <LoginPage /> },
    ],
  },
  {
    path: '/adsysop/:username?',
    element: <LoginDashboard />
  },
  {
    path: '/lomwong/:username/:channel',
    element: <LomwongPage />,
  },
  {
    path: '/lomwong/helps/:username',
    element: <HelpDeskPage />,
    children: [
      {
        path: '/lomwong/helps/:username/:ticket',
        element: ''
      }
    ]
  },
  {
    path: '/error',
    element: <ErrorPage />
  }
])