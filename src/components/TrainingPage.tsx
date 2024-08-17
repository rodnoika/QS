import React from 'react';
import './TrainingPage.css';

const TrainingPage: React.FC = () => {
  const blockTitles = [
    'Математика',
    'Стереометрия',
    'Логика',
    'Мнемотехника',
    'Игры на внимательность',
    'Быстрые игры'
  ];

  return (
    <div className="training-page">
      <h1 className="page-title">Тренировка</h1>
      <div className="blocks-container">
        {blockTitles.map((title, index) => (
          <div key={index} className="block">
            {title}
          </div>
        ))}
      </div>
      <div className='home-button'>
        Домой
      </div>
    </div>
  );
};

export default TrainingPage;