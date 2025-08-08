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
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/first-time" element={<FirstTime />} />
      <Route path="/been-here-before" element={<BeenHereBefore />} />
      <Route path="/error" element={<Error />} />
    </Routes>
  );
};

export default LogBook; 