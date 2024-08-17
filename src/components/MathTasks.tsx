import React from 'react';
import './MathTasks.css';

const MathTasks: React.FC = () => {
  return (
    <div className="MathTasks">
      <h2>Math Tasks</h2>
      <ul>
        <li>Solve equations: x + 5 = 12</li>
        <li>Calculate the area of a triangle with base 10 and height 5</li>
        <li>Solve the quadratic equation: x^2 - 4x - 5 = 0</li>
      </ul>
    </div>
  );
}

export default MathTasks;
