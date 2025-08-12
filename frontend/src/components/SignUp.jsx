import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ripples, setRipples] = useState([]);

  const { username, firstName, lastName, email, password, confirmPassword } = formData;

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
    await axios.post('/api/auth/signup', { username, firstName, lastName, email, password });
    console.log('Signup successful');
    navigate('/dashboard'); // Redirect to dashboard page
    } catch (err) {
      console.error('Signup error:', err.response?.data);
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Ripple effect on button click
  const createRipple = (event) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(button.clientWidth, button.clientHeight);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    const newRipple = { x, y, size, key: Date.now() };
    setRipples((oldRipples) => [...oldRipples, newRipple]);
    setTimeout(() => {
      setRipples((oldRipples) => oldRipples.filter((r) => r.key !== newRipple.key));
    }, 600);
  };

  // Use shake animation if error exists
  const CardComponent = error ? ErrorShakeSignUpCard : SignUpCard;

  return (
    <PageContainer>
      <CardComponent>
        <Title>Create an Account</Title>
        <Subtitle>Get started with us</Subtitle>

        {error && <SmoothErrorMessage>{error}</SmoothErrorMessage>}

        <StyledForm onSubmit={onSubmit}>
          <InputGroup>
            <EnhancedInput
              type="text"
              name="username"
              value={username}
              onChange={onChange}
              placeholder="Username"
              required
            />
          </InputGroup>
          <NameRow>
            <InputGroup>
              <EnhancedInput
                type="text"
                name="firstName"
                value={firstName}
                onChange={onChange}
                placeholder="First Name"
                required
              />
            </InputGroup>
            <InputGroup>
              <EnhancedInput
                type="text"
                name="lastName"
                value={lastName}
                onChange={onChange}
                placeholder="Last Name"
                required
              />
            </InputGroup>
          </NameRow>
          <InputGroup>
            <EnhancedInput
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="Email Address"
              required
            />
          </InputGroup>
          <InputGroup>
            <EnhancedInput
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Password"
              required
            />
          </InputGroup>
          <InputGroup>
            <EnhancedInput
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              placeholder="Confirm Password"
              required
            />
          </InputGroup>
          <SubmitButton
            type="submit"
            disabled={isLoading}
            onClick={createRipple}
            style={{ position: 'relative', overflow: 'hidden' }}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
            {ripples.map(({ x, y, size, key }) => (
              <RippleContainer
                key={key}
                style={{
                  width: size,
                  height: size,
                  top: y,
                  left: x,
                  position: 'absolute',
                }}
              />
            ))}
          </SubmitButton>
        </StyledForm>

        <Divider />

        <SignInText>
          Already have an account? <StyledLink to="/signin">Sign In</StyledLink>
        </SignInText>

        <BackToHome>
          <StyledLink to="/">← Back to Home</StyledLink>
        </BackToHome>
      </CardComponent>
    </PageContainer>
  );
};

// Keyframes for animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ripple = keyframes`
  0% {
    transform: scale(0);
    opacity: 0.75;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
`;

const bounceIn = keyframes`
  0% { transform: translateY(-100%) scale(0); opacity: 0; }
  60% { transform: translateY(15%) scale(1.1); opacity: 1; }
  80% { transform: translateY(-7%) scale(0.95); }
  100% { transform: translateY(0) scale(1); }
`;

// Styled Components
const PageContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const SignUpCard = styled.div`
  background: #ffffff;
  padding: 32px 24px;
  border-radius: 15px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  width: 100%;
  max-width: 350px;
  text-align: center;
  animation: ${fadeIn} 0.5s ease-out;
`;

const ErrorShakeSignUpCard = styled(SignUpCard)`
  animation: ${shake} 0.5s;
`;

const Title = styled.h1`
  color: #333;
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 10px;
`;

const Subtitle = styled.p`
  color: #777;
  font-size: 16px;
  margin-bottom: 30px;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const InputGroup = styled.div`
  position: relative;
  flex: 1;
`;

const NameRow = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 0px;
  @media (max-width: 500px) {
    flex-direction: column;
    gap: 0;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
`;

const EnhancedInput = styled(Input)`
  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 8px rgba(0, 123, 255, 0.7);
    transform: scale(1.02);
    transition: all 0.3s ease;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 15px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    background: #0056b3;
  }

  &:disabled {
    background: #a0c8ff;
    cursor: not-allowed;
  }
`;

const RippleContainer = styled.span`
  position: absolute;
  border-radius: 50%;
  transform: scale(0);
  animation: ${ripple} 600ms linear;
  background-color: rgba(255, 255, 255, 0.7);
  pointer-events: none;
`;

const Divider = styled.div`
  height: 1px;
  background: #eee;
  margin: 30px 0;
`;



const ErrorMessage = styled.div`
  background: #ffe6e6;
  color: #dc3545;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
`;

const SmoothErrorMessage = styled(ErrorMessage)`
  opacity: 0;
  animation: ${fadeIn} 0.5s forwards;
`;

const SignInText = styled.p`
  margin-top: 30px;
  color: #777;
  font-size: 14px;
`;

const BackToHome = styled.div`
  margin-top: 20px;
  text-align: center;
`;

const StyledLink = styled(Link)`
  color: #007bff;
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

export default SignUp;
