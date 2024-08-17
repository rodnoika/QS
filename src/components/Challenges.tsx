import React, { useState } from 'react';
import './Challenges.css';

interface Challenge {
  id: number;
  description: string;
  isCompleted: boolean;
}

const initialChallenges: Challenge[] = [
  { id: 1, description: 'Complete 5 math exercises', isCompleted: false },
  { id: 2, description: 'Solve a logic puzzle', isCompleted: false },
];

const Challenges: React.FC = () => {
  const [challenges, setChallenges] = useState(initialChallenges);

  const completeChallenge = (id: number) => {
    setChallenges(challenges.map(challenge =>
      challenge.id === id ? { ...challenge, isCompleted: true } : challenge
    ));
  };

  return (
    <div className="Challenges">
      <h2>Current Challenges</h2>
      <ul>
        {challenges.map(challenge => (
          <li key={challenge.id} className={challenge.isCompleted ? 'completed' : ''}>
            {challenge.description}
            {!challenge.isCompleted && (
              <button onClick={() => completeChallenge(challenge.id)}>Mark as Completed</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Challenges;
