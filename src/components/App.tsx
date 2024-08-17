import React, { useState } from 'react';
import {Link } from 'react-router-dom';
import './App.css';
import Profile from './Profile';
import Challenges from './Challenges';
import Recommendations from './Recommendations';
import TopUsers from './TopUsers';


const App: React.FC = () => {
  const [userProfile, setUserProfile] = useState({ name: 'John Doe', progress: 75, points: 10 });

  return (
    <div className="App">
      <header className="App-header">
          <h1>QuickStarter</h1>
          <nav>
            <Link to="/">Home</Link>
            <Link to="/Test">Tests</Link>
            <Link to="/Results">Results</Link>
          </nav>
        </header>
      <main>
        <Profile />
        <TopUsers/>
        <Recommendations />
        <Challenges />
      </main>
    </div>
  );
}

export default App;
