import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CheckCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VerifiedNews = () => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchVerified = async () => {
            try {
                const res = await axios.get('/api/fact-check/all');
                // Filter news that has been verified or has high community score
                const verified = res.data.filter(n =>
                    n.status === 'verified' || n.analysisResult?.score >= 70
                );
                setNews(verified);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchVerified();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 pt-20 sm:pt-24">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                Verified News
            </h1>
            <p className="text-gray-400 mb-8">News items that have been verified as credible by our system and community.</p>

            {loading ? (
                <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : news.length === 0 ? (
                <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
                    <CheckCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No verified news yet.</p>
                    <p className="text-sm text-gray-500 mt-2">News with score ≥ 70 or admin-verified will appear here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {news.map(item => (
                        <div
                            key={item._id}
                            onClick={() => navigate('/result', { state: { result: item, content: item.content } })}
                            className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-5 hover:bg-white/10 cursor-pointer transition-all"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">
                                    VERIFIED
                                </span>
                                <span className="text-lg font-bold text-green-500">
                                    {item.analysisResult?.score}/100
                                </span>
                            </div>
                            <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                                {item.content}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-4">
                                <div className="flex items-center gap-1">
                                    <ThumbsUp className="h-4 w-4" /> {item.votes?.up || 0}
                                </div>
                                <div className="flex items-center gap-1">
                                    <ThumbsDown className="h-4 w-4" /> {item.votes?.down || 0}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default VerifiedNews;
