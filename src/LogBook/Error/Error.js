import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useVisitor } from '../../context/VisitorContext';
import '../welcome.css';

const Error = () => {
  const navigate = useNavigate();
  const { selectedBranchName } = useVisitor();

  const handleGoBack = () => {
    navigate('/logbook');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="error-container">
      <div className="logo-container">
        <img src={process.env.PUBLIC_URL + "/fnb back.png"} alt="FNB Logo" className="logo" />
        <h2 className="logo-text">FNB (First National Bank)</h2>
      </div>

      <div className="error-content">
        <div className="error-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        
        <h1 className="error-title">Oops! Something went wrong</h1>
        <p className="error-message">
          We encountered an error while processing your request. 
          Please try again or contact support if the problem persists.
        </p>
        
        {selectedBranchName && (
          <p className="branch-info">
            Branch: {selectedBranchName}
          </p>
        )}

        <div className="error-actions">
          <button onClick={handleGoBack} className="back-button">
            Try Again
          </button>
          <button onClick={handleGoHome} className="home-button">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error;
