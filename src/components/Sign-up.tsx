import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import './form.css';

const SignUpPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [surname, setSurname] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate(); // Хук для навигации


  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (!email || !password || !name || !surname) {
        throw new Error('All fields are required');
      }

      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          surname: surname,
          username: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }
      navigate('/sign-in');
      setSuccess('Registration successful! Please log in.');
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="sign-in-page">
      <h1 className="page-title">Sign Up</h1>
      <form className="sign-in-form" onSubmit={handleSignUp}>
        <h2>Введите свою почту, пароль, имя и фамилию</h2>
        <div className="form-group">
          <label htmlFor="name">Имя</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="surname">Фамилия</label>
          <input
            type="text"
            id="surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Электронная почта:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Пароль:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
        <button type="submit" className="sign-in-button">Зарегистрироваться</button>
        <h2>Проблемы? Напишите на нашу почту mentalfit.help@gmail.com</h2>
        <div className="additional-links">
          <p className="no-account">Есть аккаунт? <Link to={'/Sign-In'}>Войдите</Link></p>
        </div>
      </form>
    </div>
  );
};

export default SignUpPage