import React from 'react';
import { Link } from 'react-router-dom';
import './TrainingPage.css';
import Logo from '../Logo';

const TrainingPage: React.FC = () => {
  const blockTitles = [
    { title: 'Математика', path: '/Training/Math' },
    { title: 'Стереометрия', path: '/Training/Stereometry' },
    { title: 'Логика', path: '/Training/Logic' },
    { title: 'Мнемотехника', path: '/Training/Mnemonics' },
    { title: 'Игры на внимательность', path: '/Training/AttentionGames' },
    { title: 'Быстрые игры', path: '/Training/SpeedGames' }
  ];

  return (
    <div className="training-page">
      <Logo />
      <h1 className="page-title">Тренировка</h1>
      <div className="blocks-container">
        {blockTitles.map((block, index) => (
          <Link key={index} to={block.path} className="block">
            {block.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TrainingPage;
