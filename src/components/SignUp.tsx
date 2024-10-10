import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo/temp-logo.svg';
import axios from 'axios';

const API_URL = '/.netlify/functions/api'; // Update this line

const SignUp: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [isDark, setIsDark] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [generatedInviteCode, setGeneratedInviteCode] = useState('');

  useEffect(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await axios.post(`${API_URL}/api/signup`, { email, password, inviteCode });
      navigate('/login');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
        setError(error.response.data.message as string);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateInviteCode = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_URL}/api/generate-invite`);
      setGeneratedInviteCode(response.data.code);
      setInviteCode(response.data.code);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data && typeof error.response.data === 'object' && 'message' in error.response.data) {
        setError(error.response.data.message as string);
      } else {
        setError('An unexpected error occurred while generating invite code');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const styles: { [key: string]: React.CSSProperties } = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: isDark
        ? `linear-gradient(to bottom, #1a202c, #2d3748)`
        : `linear-gradient(to bottom, #e0f2fe, #bfdbfe)`,
      padding: '1rem',
    },
    formContainer: {
      width: '100%',
      maxWidth: '400px',
      padding: '2rem',
      borderRadius: '1rem',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
      background: isDark ? 'rgba(26, 32, 44, 0.8)' : 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      boxSizing: 'border-box',
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '1.5rem',
      position: 'relative',
    },
    themeToggle: {
      position: 'absolute',
      top: '0',
      right: '0',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      fontSize: '1.5rem',
    },
    logo: {
      width: '4rem',
      height: '4rem',
      marginBottom: '1rem',
      display: 'inline-block',
    },
    title: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '0.5rem',
      color: isDark ? 'white' : '#1f2937',
    },
    subtitle: {
      color: isDark ? '#9ca3af' : '#4b5563',
      fontSize: '0.875rem',
    },
    inputContainer: {
      position: 'relative',
      marginBottom: '1rem',
      width: '100%',
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      borderRadius: '0.5rem',
      border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
      background: isDark ? 'rgba(55, 65, 81, 0.8)' : 'rgba(243, 244, 246, 0.8)',
      color: isDark ? 'white' : 'black',
      fontSize: '1rem',
      boxSizing: 'border-box',
    },
    passwordToggle: {
      position: 'absolute',
      right: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: isDark ? '#9ca3af' : '#6b7280',
      fontSize: '1rem',
    },
    signUpButton: {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      border: 'none',
      background: isDark ? '#3b82f6' : '#2563eb',
      color: 'white',
      fontWeight: 'bold',
      cursor: 'pointer',
      transition: 'background 0.3s, transform 0.1s',
      fontSize: '1rem',
      marginTop: '1rem',
    },
    loginContainer: {
      textAlign: 'center' as const,
      marginTop: '1.5rem',
    },
    loginText: {
      color: isDark ? '#9ca3af' : '#4b5563',
      fontSize: '0.875rem',
    },
    loginButton: {
      background: 'none',
      border: 'none',
      color: '#3b82f6',
      cursor: 'pointer',
      fontWeight: 'bold',
    },
    errorMessage: {
      color: '#ef4444',
      backgroundColor: isDark ? 'rgba(127, 29, 29, 0.5)' : 'rgba(254, 202, 202, 0.5)',
      padding: '0.75rem',
      borderRadius: '0.5rem',
      marginTop: '1rem',
      fontSize: '0.875rem',
      textAlign: 'center' as const,
    },
  };

  const generateInviteButton: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.5rem',
    border: 'none',
    background: isDark ? '#4b5563' : '#e5e7eb',
    color: isDark ? 'white' : 'black',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.3s, transform 0.1s',
    fontSize: '1rem',
    marginTop: '1rem',
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <div style={styles.header}>
          <button onClick={toggleTheme} style={styles.themeToggle}>
            {isDark ? '☀️' : '🌙'}
          </button>
          <img src={logo} alt="Logo" style={styles.logo} />
          <h1 style={styles.title}>Create an Account</h1>
          <p style={styles.subtitle}>Sign up to get started</p>
        </div>

        <form onSubmit={handleSignUp}>
          <div style={styles.inputContainer}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.inputContainer}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              style={styles.input}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <div style={styles.inputContainer}>
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Invite Code"
              style={styles.input}
              required
            />
          </div>
          <button
            type="submit"
            style={{
              ...styles.signUpButton,
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <button
          onClick={handleGenerateInviteCode}
          style={generateInviteButton}
          disabled={isLoading}
        >
          Generate Invite Code
        </button>

        {generatedInviteCode && (
          <p style={{ ...styles.subtitle, marginTop: '1rem' }}>
            Generated Invite Code: {generatedInviteCode}
          </p>
        )}

        <div style={styles.loginContainer}>
          <p style={styles.loginText}>
            Already have an account?{' '}
            <button style={styles.loginButton} onClick={() => navigate('/login')}>
              Log in
            </button>
          </p>
        </div>
        {error && <div style={styles.errorMessage}>{error}</div>}
      </div>
    </div>
  );
};

export default SignUp;