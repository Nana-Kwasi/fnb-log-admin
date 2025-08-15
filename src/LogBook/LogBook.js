import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Welcome from './Welcome/Welcome';
import FirstTime from './First-Time/FirstTime';
import BeenHereBefore from './Been-Here/BeenHereBefore';
import Error from './Error/Error';
import './welcome.css';
import './logout.css';

const LogBook = () => {
  return (
    <div className="logbook-container" style={{
      width: '100%',
      height: '100vh',
      overflow: 'auto',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/first-time" element={<FirstTime />} />
        <Route path="/been-here-before" element={<BeenHereBefore />} />
        <Route path="/error" element={<Error />} />
      </Routes>
    </div>
  );
};

export default LogBook; 