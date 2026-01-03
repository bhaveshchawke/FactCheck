import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogIn, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkUser = () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                setUser(null);
            }
        };

        checkUser();

        window.addEventListener('auth-change', checkUser);
        return () => window.removeEventListener('auth-change', checkUser);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-change'));
        navigate('/login');
    };

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/verified', label: 'Verified News' },
        { to: '/report', label: 'Report Fake' },
    ];

    return (
        <nav className="bg-darker/80 backdrop-blur-md border-b border-primary/20 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <ShieldCheck className="h-8 w-8 text-primary group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all" />
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                        TrueCheck
                    </span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map(link => (
                        <Link key={link.to} to={link.to} className="text-gray-300 hover:text-primary transition-colors">
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-gray-400 hover:text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>

                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <Link to="/admin" className="text-gray-300 hover:text-primary transition-colors flex items-center gap-1">
                                    <LayoutDashboard className="h-4 w-4" /> Admin
                                </Link>
                            )}
                            <button onClick={handleLogout} className="px-4 py-2 rounded-full border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-all flex items-center gap-2">
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="px-4 py-2 rounded-full border border-primary/50 text-primary hover:bg-primary/10 transition-all flex items-center gap-2">
                            <LogIn className="h-4 w-4" />
                            <span>Login</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-darker/95 border-t border-white/10 overflow-hidden"
                    >
                        <div className="px-4 py-4 space-y-3">
                            {navLinks.map(link => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block py-2 text-gray-300 hover:text-primary transition-colors"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <div className="pt-3 border-t border-white/10">
                                {user ? (
                                    <>
                                        {user.role === 'admin' && (
                                            <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-gray-300 hover:text-primary">
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="w-full text-left py-2 text-red-400">
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-primary">
                                        Login / Sign Up
                                    </Link>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
