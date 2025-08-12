import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from 'react-icons/fa';

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ToastItem = styled.div`
  background: ${props => {
    switch (props.type) {
      case 'success': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'error': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      case 'info': return 'linear-gradient(135deg, #3b82f6, #2563eb)';
      default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  }};
  color: white;
  padding: 16px 20px;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  min-width: 300px;
  max-width: 400px;
  display: flex;
  align-items: center;
  gap: 12px;
  animation: ${slideIn} 0.3s ease-out;
  
  &.exiting {
    animation: ${slideOut} 0.3s ease-out forwards;
  }
`;

const ToastIcon = styled.div`
  font-size: 20px;
  flex-shrink: 0;
`;

const ToastContent = styled.div`
  flex: 1;
`;

const ToastTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
`;

const ToastMessage = styled.div`
  font-size: 13px;
  opacity: 0.9;
`;

const ToastClose = styled.button`
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  opacity: 0.7;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

const Toast = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onClose();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <FaCheckCircle />;
      case 'error': return <FaTimesCircle />;
      case 'info': return <FaInfoCircle />;
      default: return <FaInfoCircle />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'success': return 'Success!';
      case 'error': return 'Error!';
      case 'info': return 'Info';
      default: return 'Notification';
    }
  };

  return (
    <ToastItem 
      type={type} 
      className={isExiting ? 'exiting' : ''}
    >
      <ToastIcon>{getIcon()}</ToastIcon>
      <ToastContent>
        <ToastTitle>{getTitle()}</ToastTitle>
        <ToastMessage>{message}</ToastMessage>
      </ToastContent>
      <ToastClose onClick={handleClose}>
        <FaTimesCircle />
      </ToastClose>
    </ToastItem>
  );
};

export default Toast;
