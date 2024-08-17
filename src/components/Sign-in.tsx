import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Импортируем useNavigate
import './form.css';

const SignInPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate(); // Хук для навигации

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (!email || !password) {
        throw new Error('Both fields are required');
      }

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Sign-in failed');
      }

      const { access_token } = await response.json();

      document.cookie = `access_token=${access_token}; path=/`;

      setSuccess('Sign-in successful! Redirecting...');
      navigate('/');

    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="sign-in-page">
      <h1 className="page-title">Sign in</h1>
      <form className="sign-in-form" onSubmit={handleSignIn}>
        <h2>Введите свою почту и пароль</h2>
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
        <button type="submit" className="sign-in-button">Войти</button>
        <h2>Проблемы? Напишите на нашу почту mentalfit.help@gmail.com</h2>
        <div className="additional-links">
          <a href="/forgot-password" className="forgot-password-link">Забыли пароль?</a>
          <p className="no-account">Нет аккаунта? <Link to="/sign-up" className="sign-up-link">Зарегистрируйтесь</Link></p>
        </div>
      </form>
    </div>
  );
};

export default SignInPage;