import React from 'react';
import axios from 'axios';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import ScoreMeter from '../components/ScoreMeter';
import TrustGraph from '../components/TrustGraph';
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Info, ExternalLink } from 'lucide-react';

const Result = () => {
    const location = useLocation();
    const { result, content } = location.state || {}; // { result: { score, category, breakdown, heuristicReasons, matchedClaims }, content }

    if (!result) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-400 mb-4">No result found.</p>
                    <Link to="/" className="text-primary hover:underline">Go Back</Link>
                </div>
            </div>
        );
    }

    const { analysisResult, content: newsContent, _id } = result;
    const { score, category, breakdown, matchedClaims, heuristicReasons, aiAnalysis, searchResults } = analysisResult;

    const handleVote = async (type) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Please login to vote!');
                return;
            }
            await axios.post(`http://localhost:5000/api/fact-check/${_id}/vote`, { type }, {
                headers: { 'x-auth-token': token }
            });
            alert('Thank you for your vote!');
        } catch (err) {
            console.error(err);
            if (err.response && err.response.status === 401) {
                alert('Session expired. Please login again.');
            } else {
                alert('Voting failed - ' + (err.response?.data?.msg || 'Server error'));
            }
        }
    };

    return (
        <div className="min-h-screen pt-20 sm:pt-24 pb-12 px-3 sm:px-4 container mx-auto max-w-4xl">
            <Link to="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6 sm:mb-8 transition-colors text-sm sm:text-base">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Search
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Left Column: Score */}
                <div className="lg:col-span-1">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl flex flex-col items-center shadow-lg sticky top-24">
                        <h2 className="text-gray-400 mb-6 font-medium">Credibility Score</h2>
                        <ScoreMeter score={score} />

                        <div className="mt-8 w-full space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Heuristics</span>
                                <span className={breakdown.keywordScore > 0 ? "text-green-400" : "text-red-400"}>
                                    {breakdown.keywordScore > 0 ? '+' : ''}{breakdown.keywordScore}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Google API</span>
                                <span className={breakdown.apiScore > 0 ? "text-green-400" : breakdown.apiScore < 0 ? "text-red-400" : "text-gray-500"}>
                                    {breakdown.apiScore > 0 ? '+' : ''}{breakdown.apiScore}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Community</span>
                                <span className="text-gray-500">0</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details */}
                <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
                        <h3 className="text-xl font-bold mb-4 text-white">Analysis Details</h3>
                        <p className="text-gray-300 italic mb-6 border-l-4 border-primary/50 pl-4 py-2 bg-white/5 rounded-r-lg">
                            "{content.length > 150 ? content.substring(0, 150) + '...' : content}"
                        </p>

                        <TrustGraph analysisResult={analysisResult} />

                        <div className="space-y-4 pt-6">
                            {aiAnalysis && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        AI Deep Analysis
                                    </h4>
                                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 space-y-3">
                                        <div className="flex justify-between items-center border-b border-purple-500/20 pb-2">
                                            <span className="text-gray-300">AI Trust Score</span>
                                            <span className={`font-bold ${aiAnalysis.trustScore > 70 ? 'text-green-400' : aiAnalysis.trustScore < 40 ? 'text-red-400' : 'text-yellow-400'}`}>
                                                {aiAnalysis.trustScore}/100
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-300 mb-1"><span className="text-purple-300 font-medium">Bias:</span> {aiAnalysis.bias}</p>
                                            <p className="text-sm text-gray-400 italic">"{aiAnalysis.summary}"</p>
                                        </div>
                                        {aiAnalysis.fallacies && aiAnalysis.fallacies.length > 0 && (
                                            <div>
                                                <p className="text-xs text-purple-300 mb-1 uppercase tracking-wide">Detected Fallacies:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {aiAnalysis.fallacies.map((fallacy, idx) => (
                                                        <span key={idx} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30">
                                                            {fallacy}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {searchResults && searchResults.length > 0 && (
                                <div className="mb-6">
                                    <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                        Source Citations
                                    </h4>
                                    <div className="space-y-3">
                                        {searchResults.map((source, idx) => (
                                            <a key={idx} href={source.link} target="_blank" rel="noopener noreferrer" className="block bg-blue-900/10 border border-blue-500/20 hover:bg-blue-900/20 hover:border-blue-500/40 p-3 rounded-lg transition-all group">
                                                <div className="flex justify-between items-start">
                                                    <h5 className="text-blue-300 font-medium text-sm group-hover:underline truncate pr-4">{source.title}</h5>
                                                    <ExternalLink className="h-3 w-3 text-blue-400 mt-1 shrink-0 opacity-50 group-hover:opacity-100" />
                                                </div>
                                                <p className="text-gray-400 text-xs mt-1 line-clamp-2">{source.snippet}</p>
                                                <span className="text-xs text-blue-500/70 mt-2 block">{source.source}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {heuristicReasons && heuristicReasons.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Heuristic Flags</h4>
                                    <ul className="space-y-2">
                                        {heuristicReasons.map((reason, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-yellow-400 bg-yellow-400/10 p-2 rounded text-sm">
                                                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                                                {reason}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {matchedClaims && matchedClaims.length > 0 ? (
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">Fact Checks</h4>
                                    <div className="space-y-3">
                                        {matchedClaims.map((claim, idx) => (
                                            <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/10">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-bold text-white">{claim.claimant}</span>
                                                    <span className={`text-xs px-2 py-1 rounded border ${claim.claimReview[0].textualRating.toLowerCase().includes('false') ? 'border-red-500 text-red-400 bg-red-500/10' :
                                                        'border-green-500 text-green-400 bg-green-500/10'
                                                        }`}>
                                                        {claim.claimReview[0].textualRating}
                                                    </span>
                                                </div>
                                                <p className="text-gray-400 text-sm mb-2">{claim.text}</p>
                                                <a href={claim.claimReview[0].url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline flex items-center gap-1">
                                                    Read Full Report <ExternalLink className="h-3 w-3" />
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2 text-gray-500 text-sm bg-white/5 p-4 rounded-lg border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Info className="h-4 w-4 text-blue-400" />
                                        <span>No direct fact-check found in Google's database.</span>
                                    </div>
                                    <p className="ml-6 text-xs text-gray-400">
                                        The score is based on text analysis (55/100). If this news is from a reputable site, try analyzing the <b>URL</b> directly to verify the source credibility.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Voting Section */}
                    <div className="bg-gradient-to-r from-darker to-slate-900 border border-white/10 rounded-2xl p-6 flex items-center justify-between">
                        <div>
                            <h4 className="text-white font-bold">Do you agree?</h4>
                            <p className="text-gray-400 text-sm">Vote to improve accuracy.</p>
                        </div>
                        <div className="flex gap-4">
                            <button onClick={() => handleVote('up')} className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 rounded-lg border border-green-500/50 transition-colors">
                                Valid
                            </button>
                            <button onClick={() => handleVote('down')} className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg border border-red-500/50 transition-colors">
                                Fake
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Result;
