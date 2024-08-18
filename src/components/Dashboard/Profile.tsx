import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import './Profile.css';

interface UserProfile {
  name: string;
  progress: number;
  points: number;
  profilePicture?: string;
}

const Profile: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = Cookies.get('access_token');
      if (token) {
        try {
          const response = await fetch('http://64.227.24.115:8000/users/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }

          const userData = await response.json();
          setUser(userData);
          setUser((prevUser) => prevUser ? { ...prevUser, points: userData.points } : null);
          console.log(userData);
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setLoading(false);
        }
      } else {
        setError('No token found');
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (selectedFile) {
      const token = Cookies.get('access_token');
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const response = await fetch('http://64.227.24.115/users/me/profile-picture', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload profile picture');
        }

        const result = await response.json();
        setUser((prevUser) => prevUser ? { ...prevUser, profilePicture: result.profilePicture } : null);
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  const addPoints = async (amount: number) => {
    const token = Cookies.get('access_token');
    if (token) {
      try {
        const response = await fetch('http://64.227.24.115/users/me/add-points', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount }),
        });

        if (!response.ok) {
          throw new Error('Failed to add points');
        }

        const result = await response.json();
        setUser((prevUser) => prevUser ? { ...prevUser, points: result.points } : null);
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  if (!user) return <p>No user data available</p>;

  return (
    <div className="Profile">
      <h2>{user.name}</h2>
      <p>Progress: 70%</p>
      <p>Points: {user.points}</p>
      <button onClick={() => addPoints(10)}>Earn 10 Points</button>
    </div>
  );
};

export default Profile;
