import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const location = useLocation();
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Not logged in
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Admin route but user is not admin
    if (requireAdmin && user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h2>
                    <p className="text-gray-400 mb-4">You need admin privileges to access this page.</p>
                    <a href="/" className="text-primary hover:underline">Go to Home</a>
                </div>
            </div>
        );
    }

    return children;
};

export default ProtectedRoute;
