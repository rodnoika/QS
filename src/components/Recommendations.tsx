import React from 'react';
import './Recommendations.css';

interface Recommendation {
  subject: string;
  description: string;
}

const recommendations: Recommendation[] = [
  { subject: 'Math', description: 'Solve algebra exercises to strengthen your skills.' },
  { subject: 'Logic', description: 'Work on pattern recognition puzzles to improve problem-solving abilities.' },
];

const Recommendations: React.FC = () => {
  return (
    <div className="Recommendations">
      <h2>Recommended Exercises</h2>
      <ul>
        {recommendations.map((rec, index) => (
          <li key={index}>
            <strong>{rec.subject}:</strong> {rec.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Recommendations;
