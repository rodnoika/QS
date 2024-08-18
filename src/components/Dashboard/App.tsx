import React, { useState } from 'react';
import {Link } from 'react-router-dom';
import './App.css';
import Profile from './Profile';
import Challenges from './Challenges';
import Recommendations from './Recommendations';
import TopUsers from './TopUsers';
import Logo from '../Logo';


const App: React.FC = () => {

  return (
    <div className="App">
      <header className="App-header">
          <Logo/>
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
