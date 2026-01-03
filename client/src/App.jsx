import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import AnimatedBackground from './components/AnimatedBackground';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Result from './pages/Result';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Admin from './pages/Admin';
import VerifiedNews from './pages/VerifiedNews';
import ReportFake from './pages/ReportFake';

const App = () => {
  return (
    <div className="min-h-screen bg-dark text-white font-sans selection:bg-primary/30">
      <AnimatedBackground />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/result" element={<Result />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/verified" element={<VerifiedNews />} />
        <Route path="/report" element={
          <ProtectedRoute>
            <ReportFake />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
};

export default App;
