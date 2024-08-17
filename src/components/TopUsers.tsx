import React, { useState, useEffect } from 'react';
import './TopUsers.css'; // Import CSS file for styling

interface User {
  id: number;
  name: string;
  points: number;
}

const TopUsers: React.FC = () => {
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const response = await fetch('http://localhost:8000/top_users');
        if (!response.ok) {
          throw new Error('Failed to fetch top users');
        }
        const data = await response.json();
        setTopUsers(data);
      } catch (error) {
        setError('An error occurred while fetching the top users.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopUsers();
  }, []);

  if (isLoading) {
    return <p className="loading">Loading...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="top-users-container">
      <h2>Top Users by Points</h2>
      <div className="top-users-list">
        {topUsers.map(user => (
          <div key={user.id} className="user-card">
            <h3>{user.name}</h3>
            <p>Points: {user.points}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopUsers;
