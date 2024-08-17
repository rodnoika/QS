import React, { useState, useEffect } from 'react';
import './UserResults.css'; // Import your CSS file for styling
import Cookies from 'js-cookie';

interface TestResult {
  id: number;
  test_name: string;
  correct_percentage: number;
  total_questions: number;
}

const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const token = Cookies.get('access_token');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch('http://localhost:8000/sat_verbal_results/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch results');
        }

        const data = await response.json();
        setResults(data);
      } catch (error) {
        setError('An error occurred while fetching the results.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [token]);

  const addPoints = async (amount: number) => {
    if (token) {
      try {
        const response = await fetch('http://localhost:8000/users/me/add-points', {
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
      } catch (err) {
        setError((err as Error).message);
      }
    }
  };

  if (isLoading) {
    return <p className="loading">Loading...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div className="results-page">
      <nav className="navbar">
        <h1>Results</h1>
      </nav>
      <div className="results-container">
        {results.map((result) => (
          <div key={result.id} className="result-card">
            <h3>{result.test_name}</h3>
            <p>Total Questions: {result.total_questions}</p>
            <p>Correct Percentage: {result.correct_percentage.toFixed(2)}%</p>
            <button onClick={() => addPoints(result.correct_percentage * 100 + 1)}>
              Add {result.correct_percentage * 100 + 1} Points
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultsPage;
