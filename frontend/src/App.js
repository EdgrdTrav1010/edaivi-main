import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Компоненты
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import AudioUploader from './components/AudioUploader';
import FilterPanel from './components/FilterPanel';
import Login from './components/Login';
import Register from './components/Register';

// Контекст для управления состоянием
import { AuthProvider, useAuth } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';

function App() {
  return (
    <AuthProvider>
      <AudioProvider>
        <Router>
          <div className="App">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/upload" element={<ProtectedRoute><AudioUploader /></ProtectedRoute>} />
                <Route path="/filters" element={<ProtectedRoute><FilterPanel /></ProtectedRoute>} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AudioProvider>
    </AuthProvider>
  );
}

// Компонент для защищенных маршрутов
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

export default App;