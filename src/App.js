import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import QuizSelection from './pages/QuizSelection';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { QuizProvider } from './context/QuizContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <QuizProvider>
        <Router>
          <div className="App">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/quiz-selection" element={<QuizSelection />} />
                <Route path="/quiz/:subject" element={<Quiz />} />
                <Route path="/results" element={<Results />} />
              </Routes>
            </main>
          </div>
        </Router>
      </QuizProvider>
    </AuthProvider>
  );
}

export default App;
