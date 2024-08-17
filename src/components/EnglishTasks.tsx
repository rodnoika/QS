import React from 'react';
import './EnglishTasks.css';

const EnglishTasks: React.FC = () => {
  return (
    <div className="EnglishTasks">
      <h2>English Tasks</h2>
      <ul>
        <li>Write a paragraph about your favorite book</li>
        <li>Complete the sentences with the correct tense: She _____ (go) to the market yesterday.</li>
        <li>Translate the following sentences into English: "Bonjour, comment ça va?"</li>
      </ul>
    </div>
  );
}

export default EnglishTasks;
