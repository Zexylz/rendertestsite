import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #6e8efb, #a777e3);
`;

const Form = styled.form`
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const Title = styled.h2`
  text-align: center;
  color: #333;
  margin-bottom: 1rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
`;

const Button = styled.button`
  width: 100%;
  padding: 0.5rem;
  background-color: #6e8efb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #5c7cfa;
  }
`;

const Message = styled.p<{ error?: boolean }>`
  text-align: center;
  color: ${props => props.error ? 'red' : 'green'};
  margin-top: 1rem;
`;

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/forgot-password', { email });
      setResetCode(response.data.resetCode);
      setMessage('Reset code generated. Please use this code to reset your password.');
      setError('');
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data && typeof err.response.data === 'object' && 'message' in err.response.data) {
        setError(err.response.data.message as string);
      } else {
        setError('An unexpected error occurred');
      }
      setMessage('');
      setResetCode('');
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit}>
        <Title>Forgot Password</Title>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
        <Button type="submit">Generate Reset Code</Button>
        {resetCode && (
          <Message>
            Your reset code is: <strong>{resetCode}</strong>
          </Message>
        )}
        {message && <Message>{message}</Message>}
        {error && <Message error>{error}</Message>}
      </Form>
    </Container>
  );
};

export default ForgotPassword;