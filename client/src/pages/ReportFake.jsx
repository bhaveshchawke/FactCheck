import React, { useState } from 'react';
import axios from 'axios';
import { Flag, Send, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ReportFake = () => {
    const [content, setContent] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Submit to analyze endpoint first
            const res = await axios.post('/api/fact-check/analyze', {
                content,
                type: 'text'
            });

            // Navigate to result
            navigate('/result', { state: { result: res.data, content } });
        } catch (err) {
            console.error(err);
            alert('Failed to submit. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 pt-20 sm:pt-24 max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
                <Flag className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
                Report Fake News
            </h1>
            <p className="text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base">Found misinformation? Report it here and help us keep the internet safe.</p>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 sm:p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Fake News Content *
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Paste the fake news headline, message, or URL here..."
                            className="w-full bg-darker/50 border border-white/10 rounded-lg p-4 min-h-[120px] focus:ring-2 focus:ring-red-500/50 outline-none placeholder:text-gray-600"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Why do you think this is fake? (Optional)
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Explain why you believe this is misinformation..."
                            className="w-full bg-darker/50 border border-white/10 rounded-lg p-4 min-h-[80px] focus:ring-2 focus:ring-primary/50 outline-none placeholder:text-gray-600"
                        />
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex gap-3">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-200">
                            <p className="font-semibold mb-1">Before Reporting</p>
                            <p className="text-yellow-300/80">Please verify the content is actually fake. False reports help no one.</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !content}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <div className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                        ) : (
                            <>
                                <Send className="h-5 w-5" />
                                Analyze & Report
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ReportFake;
