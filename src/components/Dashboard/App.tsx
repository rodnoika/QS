import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import './App.css';
import Profile from './Profile';
import Challenges from './Challenges';
import Recommendations from './Recommendations';
import TopUsers from './TopUsers';
import Logo from '../Logo';

const App: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (!token) {
      navigate('/sign-in');
    }
  }, [navigate]);

  return (
    <div className="App">
      <header className="App-header">
        <Logo />
        <h1>QuickStarter</h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/Test">Tests</Link>
          <Link to="/Results">Results</Link>
          <Link to="/Training">Training</Link>
        </nav>
      </header>
      <main>
        <Profile />
        <TopUsers />
        <Recommendations />
        <Challenges />
      </main>
    </div>
  );
}

export default App;
