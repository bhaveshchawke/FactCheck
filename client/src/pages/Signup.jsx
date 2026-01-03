import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const Signup = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [secretCode, setSecretCode] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5000/api/auth/register', { username, email, password, secretCode });
            navigate('/login');
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.msg || 'Signup failed';
            alert(msg);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white/5 border border-white/10 p-6 sm:p-8 rounded-2xl backdrop-blur-xl">
                <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">Create Account</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-darker/50 border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-primary/50 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-darker/50 border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-primary/50 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-darker/50 border border-white/10 rounded-lg p-3 focus:ring-2 focus:ring-primary/50 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Secret Code (Optional: for Admin)</label>
                        <input
                            type="password"
                            value={secretCode}
                            onChange={(e) => setSecretCode(e.target.value)}
                            placeholder="Type 'admin123' to become Admin"
                            className="w-full bg-darker/50 border border-yellow-500/30 rounded-lg p-3 focus:ring-2 focus:ring-yellow-500/50 outline-none placeholder:text-gray-600"
                        />
                    </div>
                    <button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
                        <UserPlus className="h-5 w-5" /> Sign Up
                    </button>
                </form>
                <div className="mt-6 text-center text-sm text-gray-400">
                    Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
                </div>
            </div>
        </div>
    );
};

export default Signup;
