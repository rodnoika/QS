import React, { useState, useEffect } from 'react';
import './Math.css'; 
import Logo from '../Logo';

const Math: React.FC = () => {
  const [task, setTask] = useState<{ question: string; answer: string } | null>(null);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchNewTask();
  }, []);

  const fetchNewTask = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://134.122.22.165:8000/generate_sat_math_task');
      if (!response.ok) throw new Error('Failed to fetch task');
      const data = await response.json();
      setTask(data);
      setFeedback(null);
      await saveTask(data); // Save the task after fetching
    } catch (error) {
      setFeedback('Failed to load task.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTask = async (task: { question: string; answer: string }) => {
    try {
      const response = await fetch('http://134.122.22.165:8000/save_sat_math_task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) throw new Error('Failed to save task');
    } catch (error) {
      setFeedback('Failed to save task.');
    }
  };

  const checkAnswer = async () => {
    try {
      const response = await fetch('http://134.122.22.165:8000/check_sat_math_answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: task?.question,
          answer: userAnswer,
        }),
      });

      if (!response.ok) throw new Error('Failed to check answer');
      const result = await response.json();
      if (result.is_correct) {
        setFeedback('Correct!');
      } else {
        setFeedback(`Incorrect. The correct answer is: ${result.correct_answer}`);
      }
    } catch (error) {
      setFeedback('Failed to check answer.');
    }
  };

  return (
    <div className="sat-math-task-page">
        <Logo/>
      <h1>SAT Math Task</h1>
      {isLoading ? (
        <p>Loading task...</p>
      ) : task ? (
        <div className="task-container">
          <p className="task-question">{task.question}</p>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Enter your answer"
          />
          <button onClick={checkAnswer}>Submit Answer</button>
          {feedback && <p className="feedback">{feedback}</p>}
          <button onClick={fetchNewTask}>Get New Task</button>
        </div>
      ) : (
        <p>No task available.</p>
      )}
    </div>
  );
};

export default Math;
