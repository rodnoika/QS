import React from 'react';
import './Logo.css'; 
import logoImage from '../assets/logo.png'; 
import { Link } from 'react-router-dom';

const Logo: React.FC = () => {
  return (
    <div className="logo-container">
      <Link to="/"><img src={logoImage} alt="Logo" className="logo-image" /></Link>
    </div>
  );
};

export default Logo;
