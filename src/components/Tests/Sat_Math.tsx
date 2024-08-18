import React, { useState, useEffect } from 'react';
import './Sat_Math.css'; 
import { useNavigate } from 'react-router-dom'; 
import Cookies from 'js-cookie';
import Logo from '../Logo';

interface Task {
  question: string;
  answer: string;
}

interface TaskListProps {
  tasks: Task[];
  currentTaskIndex: number;
  onSelectTask: (index: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, currentTaskIndex, onSelectTask }) => {
  return (
    <div className="task-list">
      {tasks.map((task, index) => (
        <button
          key={index}
          className={`task-list-item ${index === currentTaskIndex ? 'active' : ''}`}
          onClick={() => onSelectTask(index)}
        >
          Task {index + 1}
        </button>
      ))}
    </div>
  );
};

const Sat_Math: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState<number>(0);
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [correctAnswersCount, setCorrectAnswersCount] = useState<number>(0);
  const [showResultModal, setShowResultModal] = useState<boolean>(false);
  const [token, setToken] = useState<string | null>(Cookies.get('access_token'));
  const [submittedTasks, setSubmittedTasks] = useState<boolean[]>([]); 
  const navigate = useNavigate(); 

  useEffect(() => {
    async function fetchTasks() {
      const tasks = [];
      for (let i = 0; i < 27; i++) {
        try {
          const response = await fetch('http://64.227.24.115:8000/generate_sat_math_task'); 
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          tasks.push(data);
          await saveTaskToDatabase(data);
        } catch (error) {
          console.error("Error fetching task:", error);
        }
      }
      setTasks(tasks);
      setSubmittedTasks(new Array(tasks.length).fill(false)); 
      setIsLoading(false);
    }
    fetchTasks();
  }, []);

  const saveTaskToDatabase = async (task: Task) => {
    try {
      const response = await fetch('http://64.227.24.115:8000/save_sat_math_task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(task),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Task saved successfully:', result);
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const handleCheckAnswer = async () => {
    if (tasks.length > 0) {
      const task = tasks[currentTaskIndex];
      try {
        const response = await fetch('http://64.227.24.115:8000/check_sat_math_answer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            question: task.question,
            answer: userAnswer,
          }),
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const result = await response.json();
        if (result.is_correct) {
          setFeedback('Correct answer!');
          setCorrectAnswersCount((prevCount) => prevCount + 1);
        } else {
          setFeedback(`Incorrect answer. The correct answer is: ${result.correct_answer}`);
        }

        setSubmittedTasks((prevSubmittedTasks) => {
          const updated = [...prevSubmittedTasks];
          updated[currentTaskIndex] = true;
          return updated;
        });

      } catch (error) {
        console.error("Error checking answer:", error);
      }
    }
  };

  const handleNextTask = () => {
    setCurrentTaskIndex((prevIndex) => Math.min(prevIndex + 1, tasks.length - 1));
    setUserAnswer('');
    setFeedback(null);
  };

  const handlePreviousTask = () => {
    setCurrentTaskIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    setUserAnswer('');
    setFeedback(null);
  };

  const handleSelectTask = (index: number) => {
    setCurrentTaskIndex(index);
    setUserAnswer('');
    setFeedback(null);
  };

  const handleFinishTest = async () => {
    try {
      const response = await fetch('http://localhost:8000/sat_math_results', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          test_name: "SAT Math",
          correct_percentage: (correctAnswersCount / tasks.length) * 100,
          total_questions: tasks.length,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      console.log('Test result saved successfully:', result);
      setShowResultModal(true);
    } catch (error) {
      console.error("Error saving test result:", error);
    }
  };

  const formatTextWithLineBreaks = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  const handleCloseModal = () => {
    setShowResultModal(false);
    navigate("/"); 
  };

  const currentTask = tasks[currentTaskIndex];

  return (
    <div className="sat-math-container">
      {isLoading ? (
        <p className="loading">Loading tasks...</p>
      ) : (
        <>
          <Logo/>
          <TaskList
            tasks={tasks}
            currentTaskIndex={currentTaskIndex}
            onSelectTask={handleSelectTask}
          />
          <div className="task-content">
            {currentTask ? (
              <>
                <p className="task-question">{formatTextWithLineBreaks(currentTask.question)}</p>
                <input
                  type="text"
                  className="task-input"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                />
                <button
                  className="task-button"
                  onClick={handleCheckAnswer}
                  disabled={submittedTasks[currentTaskIndex]} 
                >
                  Submit
                </button>
                <div className="navigation-buttons">
                  <button className="task-button" onClick={handlePreviousTask} disabled={currentTaskIndex === 0}>
                    Previous Task
                  </button>
                  <button className="task-button" onClick={handleNextTask} disabled={currentTaskIndex === tasks.length - 1}>
                    Next Task
                  </button>
                </div>
                <button className="finish-button" onClick={handleFinishTest}>Finish Test</button>
              </>
            ) : (
              <p className="loading">No tasks available.</p>
            )}
          </div>
        </>
      )}

      {showResultModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Test Results</h2>
            <p>You answered {correctAnswersCount} out of {tasks.length} tasks correctly.</p>
            <button onClick={handleCloseModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sat_Math;
