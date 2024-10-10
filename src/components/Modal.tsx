import React, { ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';
import { X } from 'lucide-react';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from { transform: translateY(-30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div<{ isDark: boolean }>`
  background-color: ${props => props.isDark ? '#1f2937' : 'white'};
  color: ${props => props.isDark ? '#f3f4f6' : '#1f2937'};
  padding: 1.5rem;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  position: relative;
  animation: ${slideIn} 0.2s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button<{ isDark: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  color: ${props => props.isDark ? '#9ca3af' : '#6b7280'};
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;

  &:hover {
    background-color: ${props => props.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
    color: ${props => props.isDark ? '#f3f4f6' : '#1f2937'};
  }
`;

const ModalBody = styled.div`
  margin-bottom: 1.5rem;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
`;

const Button = styled.button<{ primary?: boolean; isDark: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;

  ${props => props.primary
    ? `
      background-color: ${props.isDark ? '#3b82f6' : '#2563eb'};
      color: white;
      border: none;

      &:hover {
        background-color: ${props.isDark ? '#2563eb' : '#1d4ed8'};
      }
    `
    : `
      background-color: transparent;
      color: ${props.isDark ? '#e2e8f0' : '#4b5563'};
      border: 1px solid ${props.isDark ? '#4b5563' : '#d1d5db'};

      &:hover {
        background-color: ${props.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
      }
    `
  }

  &:active {
    transform: translateY(1px);
  }
`;

const Input = styled.input<{ isDark: boolean }>`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid ${props => props.isDark ? '#4b5563' : '#d1d5db'};
  background-color: ${props => props.isDark ? '#374151' : '#f9fafb'};
  color: ${props => props.isDark ? '#f3f4f6' : '#1f2937'};
  font-size: 0.875rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.isDark ? '#3b82f6' : '#2563eb'};
    box-shadow: 0 0 0 2px ${props => props.isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(37, 99, 235, 0.3)'};
  }
`;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit: () => void;
  isDark: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, onSubmit, isDark }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent isDark={isDark} onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{title}</ModalTitle>
          <CloseButton isDark={isDark} onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>
        <ModalBody>
          {children}
        </ModalBody>
        <ModalFooter>
          <Button isDark={isDark} onClick={onClose}>Cancel</Button>
          <Button primary isDark={isDark} onClick={onSubmit}>Submit</Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;