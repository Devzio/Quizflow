import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  className?: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  className = '',
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${className}`}>
        <div className="modal-header">
          {title && <h2>{title}</h2>}
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;