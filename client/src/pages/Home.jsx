import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Search, Link as LinkIcon, Type, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    const [input, setInput] = useState('');
    const [selectedFile, setSelectedFile] = useState(null); // New State
    const [imagePreview, setImagePreview] = useState(null); // Preview
    const [inputType, setInputType] = useState('text');
    const [loading, setLoading] = useState(false);
    const [recentNews, setRecentNews] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch recent fact-checked news
        const fetchRecent = async () => {
            try {
                const res = await api.get('/api/fact-check/all');
                // Filter news: Score < 50 (likely fake) AND remove duplicates
                const uniqueContent = new Set();
                const fakeNews = res.data.filter(n => {
                    const isFake = n.analysisResult?.score < 50;
                    const isDuplicate = uniqueContent.has(n.content);
                    if (isFake && !isDuplicate) {
                        uniqueContent.add(n.content);
                        return true;
                    }
                    return false;
                }).slice(0, 4);

                setRecentNews(fakeNews);
            } catch (err) {
                console.error('Failed to fetch recent news:', err);
            }
        };
        fetchRecent();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let res;
            if (inputType === 'image' && selectedFile) {
                // Handle Multipart Upload
                const formData = new FormData();
                formData.append('image', selectedFile);

                res = await api.post('/api/fact-check/analyze-multipart', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                // Existing Text/URL logic
                res = await api.post('/api/fact-check/analyze', {
                    content: input,
                    type: inputType
                });
            }
            // Navigate to result with data
            navigate('/result', { state: { result: res.data, content: input } });
        } catch (err) {
            console.error(err);
            alert('Analysis failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4"
        >
            <div className="w-full max-w-2xl text-center space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="space-y-4 px-2"
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                        Uncover the <span className="text-primary bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Truth</span>
                    </h1>
                    <p className="text-gray-400 text-base sm:text-lg md:text-xl px-2">
                        AI-powered fact checking for the modern web. Verify news, links, and headlines instantly.
                    </p>
                </motion.div>

                {/* Instructions Section (Hindi) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl"
                >
                    <div className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-md">
                        <h2 className="text-xl font-bold text-primary mb-2">🚀 TrueCheck का उपयोग कैसे करें?</h2>
                        <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
                            <li>कोई भी <strong>न्यूज़, हेडलाइन, या लिंक</strong> (Instagram/YouTube) पेस्ट करें.</li>
                            <li><strong>'Search'</strong> बटन दबाएं और जादू देखें.</li>
                            <li>AI और Google सच और झूठ का पता लगाएंगे.</li>
                        </ul>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-5 rounded-xl backdrop-blur-md">
                        <h2 className="text-xl font-bold text-secondary mb-2">🔍 हम क्या चेक करते हैं?</h2>
                        <ul className="text-gray-300 text-sm space-y-2 list-disc list-inside">
                            <li>वायरल सोशल मीडिया दावे (Viral Claims)</li>
                            <li>राजनीतिक बयान (Political Statements)</li>
                            <li>फर्जी स्कीम और ऑफर (Scams)</li>
                            <li>🤖 <strong>AI द्वारा बनाई गई तस्वीरें (Deepfakes)</strong> [New]</li>
                        </ul>
                    </div>
                </motion.div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 relative z-10 w-full">
                        <button
                            onClick={() => setInputType('text')}
                            className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-full transition-all duration-300 ${inputType === 'text' ? 'bg-primary text-black font-bold shadow-lg shadow-primary/50' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            Text/News
                        </button>
                        <button
                            onClick={() => setInputType('url')}
                            className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-full transition-all duration-300 ${inputType === 'url' ? 'bg-secondary text-black font-bold shadow-lg shadow-secondary/50' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            Link/URL
                        </button>
                        <button
                            onClick={() => setInputType('image')}
                            className={`px-3 sm:px-4 py-2 text-sm sm:text-base rounded-full transition-all duration-300 ${inputType === 'image' ? 'bg-accent text-white font-bold shadow-lg shadow-accent/50' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                            Image Check 🖼️
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="w-full relative z-10">
                        <div className="relative group">
                            {inputType === 'image' ? (
                                <div className="w-full h-64 bg-black/40 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center relative overflow-hidden group-hover:border-primary/50 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                                setSelectedFile(file);
                                                setImagePreview(URL.createObjectURL(file));
                                                setInput(file.name); // Just to satisfy disabled check
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <div className="bg-white/10 p-3 rounded-full inline-block mb-2">
                                                <Sparkles className="h-6 w-6 text-accent" />
                                            </div>
                                            <p className="font-semibold">Click to Upload Image</p>
                                            <p className="text-xs mt-1">Supports JPG, PNG (Max 5MB)</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={
                                        inputType === 'text' ? "Enter news text here..." :
                                            "Paste URL here (News Source, Instagram Reel, YouTube)..."
                                    }
                                    className="w-full h-40 bg-black/40 text-white p-4 rounded-xl border border-white/20 focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none transition-all duration-300 resize-none backdrop-blur-sm"
                                    required={inputType !== 'image'}
                                />
                            )}
                            <button
                                type="submit"
                                disabled={loading || !input}
                                className="absolute right-4 bottom-4 bg-primary hover:bg-primary/90 text-black px-6 py-2 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 z-20"
                            >
                                {loading ? (
                                    <span className="animate-spin">⌛</span>
                                ) : (
                                    <>
                                        Search <ArrowRight className="h-4 w-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="flex flex-wrap gap-4 sm:gap-8 justify-center text-xs sm:text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                        <span>Real-time</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        <span>Google API</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                        <span>Community</span>
                    </div>
                </div>

                {/* Verified Feed Section */}
                <div className="mt-12 sm:mt-16 w-full max-w-4xl text-left px-2">
                    <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                        <span className="bg-red-500 w-1 h-5 sm:h-6 rounded-full"></span>
                        Trending Verified News
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {recentNews.length > 0 ? recentNews.map((item, idx) => (
                            <div
                                key={item._id || idx}
                                onClick={() => { setInput(item.content); setInputType('text'); }}
                                className="bg-white/5 border border-white/10 p-4 rounded-xl hover:bg-white/10 cursor-pointer transition-all hover:scale-[1.01]"
                            >
                                <span className={`text-xs font-bold px-2 py-1 rounded mb-2 inline-block ${item.analysisResult?.score < 40
                                    ? 'text-red-400 bg-red-500/10'
                                    : 'text-yellow-400 bg-yellow-500/10'
                                    }`}>
                                    {item.analysisResult?.category || 'UNVERIFIED'}
                                </span>
                                <h4 className="font-semibold text-lg mb-1 truncate">
                                    "{item.content.length > 50 ? item.content.slice(0, 50) + '...' : item.content}"
                                </h4>
                                <p className="text-xs text-gray-400">Score: {item.analysisResult?.score}/100</p>
                            </div>
                        )) : (
                            <div className="col-span-2 text-center text-gray-500 py-8">
                                No recent fact-checks yet. Be the first to verify some news!
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default Home;
