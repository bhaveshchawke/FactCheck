import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, X, Trash2 } from 'lucide-react';

const Admin = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            // In a real app, this endpoint should be protected and only return reported/pending news
            const res = await axios.get('/api/fact-check/all');
            setNews(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleVerify = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login as Admin');
                return;
            }
            await axios.put(`/api/fact-check/${id}`, { status }, {
                headers: { 'x-auth-token': token }
            });
            alert(`News marked as ${status}!`);
            fetchNews(); // Refresh list
        } catch (err) {
            console.error(err);
            alert('Action failed: ' + (err.response?.data?.msg || 'Server error'));
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 pt-20 sm:pt-24">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Admin Dashboard</h1>

            <div className="overflow-x-auto bg-white/5 rounded-xl border border-white/10">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="p-4">Content</th>
                            <th className="p-4">Score</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="4" className="p-4 text-center">Loading...</td></tr>
                        ) : news.map(item => (
                            <tr key={item._id} className="border-b border-white/10 hover:bg-white/5">
                                <td className="p-4 max-w-md truncate">{item.content}</td>
                                <td className="p-4">
                                    <span className={`font-bold ${item.analysisResult.score >= 70 ? 'text-green-500' : 'text-red-500'}`}>
                                        {item.analysisResult.score}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs uppercase ${item.status === 'verified' ? 'bg-green-500/20 text-green-500' :
                                        item.status === 'rejected' ? 'bg-red-500/20 text-red-500' :
                                            'bg-yellow-500/20 text-yellow-500'
                                        }`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => handleVerify(item._id, 'verified')} className="p-2 bg-green-500/20 text-green-500 rounded hover:bg-green-500/30">
                                        <Check className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => handleVerify(item._id, 'rejected')} className="p-2 bg-red-500/20 text-red-500 rounded hover:bg-red-500/30">
                                        <X className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Admin;
