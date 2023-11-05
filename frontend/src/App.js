import React from 'react';
import {  Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Chat from './pages/Chat';
import "./App.css";

const App = () => {
  return (
    <div className='bg' >
        <Routes>
          <Route exact path="/" element={<HomePage />} />
          <Route path="/chats" element={<Chat />} />
        </Routes>
    </div>
  );
};

export default App;
