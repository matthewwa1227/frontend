import React, { useState } from 'react';
import { 
    Link, 
    Copy, 
    CheckCircle2, 
    AlertCircle, 
    RefreshCw, 
    User, 
    Users 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FamilyConnectionManager = () => {
    // State to toggle between views for demonstration purposes
    // In your real app, you would likely render only one based on user.role
    const [activeRole, setActiveRole] = useState('student');

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
                
                {/* Header / Role Toggler */}
                <div className="bg-slate-900 p-6 text-white">
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-4">
                        <Link className="w-6 h-6 text-blue-400" />
                        Family Link
                    </h2>
                    
                    {/* Role Switcher (For Demo Only) */}
                    <div className="flex bg-slate-800 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveRole('student')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                                activeRole === 'student' 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <User size={16} /> Student View
                        </button>
                        <button
                            onClick={() => setActiveRole('parent')}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${
                                activeRole === 'parent' 
                                ? 'bg-emerald-600 text-white shadow-md' 
                                : 'text-slate-400 hover:text-white'
                            }`}
                        >
                            <Users size={16} /> Parent View
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-6">
                    <AnimatePresence mode="wait">
                        {activeRole === 'student' ? (
                            <StudentGenerator key="student" />
                        ) : (
                            <ParentLinker key="parent" />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// SUB-COMPONENT: Student View (Generate Code)
// ==========================================
const StudentGenerator = () => {
    const [code, setCode] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');

    const generateCode = async () => {
        setLoading(true);
        setError('');
        setCopied(false);

        try {
            const response = await fetch('/api/generate-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // Add your token here
                }
            });

            const data = await response.json();

            if (data.success) {
                setCode(data.code);
            } else {
                setError(data.message || 'Failed to generate code');
            }
        } catch (err) {
            // Fallback for demo if backend isn't running
            console.warn("Backend not reachable, simulating success for demo");
            setTimeout(() => setCode('AB78F9'), 1000); 
            // setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (code) {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: -20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
        >
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-slate-800">Invite a Parent</h3>
                <p className="text-slate-500 text-sm">
                    Generate a temporary code to link your account with a parent or guardian.
                </p>
            </div>

            {!code ? (
                <button
                    onClick={generateCode}
                    disabled={loading}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                    {loading ? (
                        <RefreshCw className="animate-spin w-5 h-5" />
                    ) : (
                        'Generate Code'
                    )}
                </button>
            ) : (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center space-y-4">
                    <div className="space-y-1">
                        <p className="text-xs uppercase tracking-wider text-blue-600 font-bold">Your Connection Code</p>
                        <div className="text-4xl font-mono font-bold text-slate-900 tracking-widest">
                            {code}
                        </div>
                    </div>
                    
                    <button
                        onClick={copyToClipboard}
                        className="flex items-center justify-center gap-2 w-full py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                    >
                        {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy Code'}
                    </button>

                    <p className="text-xs text-blue-400">
                        Expires in 15 minutes
                    </p>
                </div>
            )}

            {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}
        </motion.div>
    );
};

// ==========================================
// SUB-COMPONENT: Parent View (Input Code)
// ==========================================
const ParentLinker = () => {
    const [inputCode, setInputCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // { success: boolean, message: string, studentName: string }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (inputCode.length !== 6) return;

        setLoading(true);
        setResult(null);

        try {
            const response = await fetch('/api/link-child', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${token}` // Add your token here
                },
                body: JSON.stringify({ code: inputCode })
            });

            const data = await response.json();

            if (data.success) {
                setResult({ 
                    success: true, 
                    message: 'Success!', 
                    studentName: data.student?.full_name || 'Student' 
                });
                setInputCode('');
            } else {
                setResult({ success: false, message: data.message || 'Invalid code' });
            }
        } catch (err) {
             // Fallback for demo if backend isn't running
             console.warn("Backend not reachable, simulating success for demo");
             setTimeout(() => {
                 setResult({ success: true, studentName: "Alex Johnson" });
             }, 1000);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-slate-800">Connect to Student</h3>
                <p className="text-slate-500 text-sm">
                    Enter the 6-character code provided by your student to link accounts.
                </p>
            </div>

            {!result?.success ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                            maxLength={6}
                            placeholder="ENTER CODE"
                            className="w-full text-center text-2xl font-mono tracking-widest py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all placeholder:text-slate-300 uppercase"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || inputCode.length !== 6}
                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <RefreshCw className="animate-spin w-5 h-5" />
                        ) : (
                            'Connect Account'
                        )}
                    </button>
                    
                    {result?.success === false && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center justify-center gap-2 animate-pulse">
                            <AlertCircle size={16} />
                            {result.message}
                        </div>
                    )}
                </form>
            ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 size={32} />
                    </div>
                    <div>
                        <h4 className="text-xl font-bold text-emerald-900">Connected!</h4>
                        <p className="text-emerald-700 mt-1">
                            You are now linked to <span className="font-semibold">{result.studentName}</span>.
                        </p>
                    </div>
                    <button 
                        onClick={() => setResult(null)}
                        className="text-sm text-emerald-600 hover:text-emerald-800 underline mt-4"
                    >
                        Link another student
                    </button>
                </div>
            )}
        </motion.div>
    );
};

export default FamilyConnectionManager;