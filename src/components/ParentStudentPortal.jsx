import React, { useState } from 'react';
import { 
    Users, 
    Copy, 
    RefreshCw, 
    Shield, 
    Check, 
    Link as LinkIcon, 
    AlertCircle,
    Loader2,
    UserMinus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Mock Data & Utilities ---
// In a real app, these would come from your API via the 'family.js' routes
const MOCK_USER_ROLE = "student"; // Change to "parent" to test the other view
const MOCK_LINKED_DATA = [
    { id: 1, name: "Sarah Connor", relation: "Mother", connectedAt: "2025-10-12" }
];

// --- Reusable UI Components (StudyQuest Style) ---

const QuestCard = ({ children, className = "", title, icon: Icon, color = "indigo" }) => {
    const borderColors = {
        indigo: "border-indigo-900",
        emerald: "border-emerald-900",
        slate: "border-slate-900"
    };
    const headerColors = {
        indigo: "bg-indigo-100 text-indigo-900",
        emerald: "bg-emerald-100 text-emerald-900",
        slate: "bg-slate-100 text-slate-900"
    };

    return (
        <div className={`bg-white border-4 ${borderColors[color] || borderColors.slate} rounded-xl shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden ${className}`}>
            {title && (
                <div className={`${headerColors[color] || headerColors.slate} border-b-4 ${borderColors[color] || borderColors.slate} p-4 flex items-center gap-3`}>
                    {Icon && <Icon className="w-6 h-6" />}
                    <h3 className="font-bold text-lg uppercase tracking-wide">{title}</h3>
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
};

const QuestButton = ({ onClick, children, variant = "primary", className = "", disabled = false }) => {
    const baseStyles = "px-4 py-3 font-bold uppercase tracking-wider text-sm rounded-lg border-2 transition-all active:translate-y-1 active:shadow-none flex items-center justify-center gap-2";
    
    const variants = {
        primary: "bg-indigo-600 text-white border-indigo-900 shadow-[0px_4px_0px_0px_rgba(49,46,129,1)] hover:bg-indigo-500 disabled:bg-indigo-400",
        success: "bg-emerald-600 text-white border-emerald-900 shadow-[0px_4px_0px_0px_rgba(6,78,59,1)] hover:bg-emerald-500 disabled:bg-emerald-400",
        secondary: "bg-white text-slate-900 border-slate-900 shadow-[0px_4px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-50 disabled:bg-slate-100",
        danger: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300 shadow-none",
    };

    return (
        <button 
            onClick={onClick} 
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${className} ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
        >
            {children}
        </button>
    );
};

// --- Main Component ---

export default function ParentStudentPortal() {
    // State for Role Toggling (For Demo Purposes)
    const [activeRole, setActiveRole] = useState(MOCK_USER_ROLE);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans text-slate-900">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                            {activeRole === 'student' ? 'Guardian Portal' : 'Parent Dashboard'}
                        </h1>
                        <p className="text-slate-600 text-lg">
                            {activeRole === 'student' 
                                ? 'Manage your guardians and share your study progress.' 
                                : 'Link student accounts to monitor their progress.'}
                        </p>
                    </div>

                    {/* Role Switcher (For Demo/Testing) */}
                    <div className="bg-white p-1 rounded-lg border-2 border-slate-200 inline-flex">
                        <button
                            onClick={() => setActiveRole('student')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeRole === 'student' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Student View
                        </button>
                        <button
                            onClick={() => setActiveRole('parent')}
                            className={`px-4 py-2 rounded-md text-sm font-bold transition-colors ${activeRole === 'parent' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Parent View
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <AnimatePresence mode="wait">
                    {activeRole === 'student' ? (
                        <StudentView key="student" />
                    ) : (
                        <ParentView key="parent" />
                    )}
                </AnimatePresence>

            </div>
        </div>
    );
}

// --- Sub-Component: Student View ---
function StudentView() {
    const [inviteCode, setInviteCode] = useState(null);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [guardians, setGuardians] = useState(MOCK_LINKED_DATA);

    // Simulate API: /api/family/generate-code
    const handleGenerateCode = () => {
        setIsRegenerating(true);
        setTimeout(() => {
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            let result = "";
            for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
            setInviteCode(result);
            setIsRegenerating(false);
        }, 800);
    };

    const handleCopy = () => {
        if(inviteCode) {
            navigator.clipboard.writeText(inviteCode);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const handleRemoveGuardian = (id) => {
        if(window.confirm("Remove this guardian?")) {
            setGuardians(prev => prev.filter(g => g.id !== id));
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
            {/* Generate Code Card */}
            <QuestCard title="Link New Guardian" icon={LinkIcon} color="indigo" className="h-full">
                <div className="flex flex-col items-center justify-center space-y-8 py-6">
                    <div className="text-center space-y-2">
                        <p className="text-slate-600 font-medium">Generate a unique code for your parent.</p>
                        <p className="text-xs text-slate-400 font-mono">EXPIRES IN 15 MINUTES</p>
                    </div>

                    {/* The Code Display */}
                    <div className="relative group w-full max-w-xs">
                        {inviteCode ? (
                            <>
                                <div className="absolute inset-0 bg-indigo-200 rounded-xl transform rotate-2 group-hover:rotate-3 transition-transform"></div>
                                <div className="relative bg-white border-2 border-indigo-600 rounded-xl p-8 flex flex-col items-center justify-center space-y-2 shadow-sm">
                                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Share this code</span>
                                    <div className="text-5xl font-black text-slate-800 tracking-widest font-mono">
                                        {inviteCode}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-40 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-slate-50">
                                <span className="text-slate-400 font-medium text-sm">No active code</span>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex w-full max-w-xs gap-3">
                        {inviteCode ? (
                            <QuestButton onClick={handleCopy} variant="primary" className="flex-1">
                                {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {isCopied ? "Copied!" : "Copy Code"}
                            </QuestButton>
                        ) : (
                            <QuestButton onClick={handleGenerateCode} variant="primary" className="flex-1" disabled={isRegenerating}>
                                {isRegenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                Generate Code
                            </QuestButton>
                        )}
                        
                        {inviteCode && (
                            <QuestButton onClick={handleGenerateCode} variant="secondary" disabled={isRegenerating}>
                                <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
                            </QuestButton>
                        )}
                    </div>
                </div>
            </QuestCard>

            {/* Connected Guardians List */}
            <div className="space-y-6">
                <QuestCard title="Connected Guardians" icon={Shield} color="slate" className="h-full">
                    <div className="space-y-4">
                        {guardians.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No guardians connected yet.</p>
                            </div>
                        ) : (
                            guardians.map((guardian) => (
                                <div key={guardian.id} className="flex items-center justify-between p-4 bg-slate-50 border-2 border-slate-200 rounded-lg group hover:border-indigo-200 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-lg font-bold text-indigo-600 shadow-sm">
                                            {guardian.name.charAt(0)}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{guardian.name}</h4>
                                            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider text-indigo-500">{guardian.relation}</p>
                                        </div>
                                    </div>
                                    <QuestButton onClick={() => handleRemoveGuardian(guardian.id)} variant="danger" className="p-2">
                                        <UserMinus className="w-5 h-5" />
                                    </QuestButton>
                                </div>
                            ))
                        )}
                    </div>
                </QuestCard>

                {/* Info Note */}
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg flex gap-3">
                    <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800 leading-relaxed">
                        <span className="font-bold">Privacy Note:</span> Guardians can view your study stats (time, subjects) and achievements. They <span className="underline">cannot</span> see your private notes or chat history.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

// --- Sub-Component: Parent View ---
function ParentView() {
    const [inputCode, setInputCode] = useState('');
    const [status, setStatus] = useState({ type: 'idle', message: '' }); // idle, loading, success, error
    const [linkedStudents, setLinkedStudents] = useState([]);

    // Simulate API: /api/family/link-child
    const handleLink = (e) => {
        e.preventDefault();
        if (inputCode.length !== 6) return;

        setStatus({ type: 'loading', message: '' });

        setTimeout(() => {
            // Mock validation
            if (inputCode === "123456" || Math.random() > 0.5) {
                setStatus({ type: 'success', message: 'Successfully linked to Alex Johnson!' });
                setLinkedStudents(prev => [...prev, { id: Date.now(), name: "Alex Johnson", grade: "10th Grade" }]);
                setInputCode('');
            } else {
                setStatus({ type: 'error', message: 'Invalid or expired code. Please check with your student.' });
            }
        }, 1500);
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
            {/* Link Form */}
            <QuestCard title="Link Student Account" icon={LinkIcon} color="emerald" className="h-full">
                <form onSubmit={handleLink} className="flex flex-col h-full justify-center space-y-6 py-4">
                    <div className="text-center">
                        <p className="text-slate-600 mb-6">Enter the 6-character code provided by your student.</p>
                        
                        <input
                            type="text"
                            maxLength={6}
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                            placeholder="ENTER CODE"
                            className="w-full max-w-xs text-center text-3xl font-mono font-bold tracking-[0.5em] py-4 border-b-4 border-slate-200 focus:border-emerald-500 outline-none transition-colors uppercase placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-sans"
                        />
                    </div>

                    {status.message && (
                        <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
                            status.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                        }`}>
                            {status.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            {status.message}
                        </div>
                    )}

                    <div className="pt-4 flex justify-center">
                        <QuestButton 
                            variant="success" 
                            className="w-full max-w-xs"
                            disabled={status.type === 'loading' || inputCode.length !== 6}
                        >
                            {status.type === 'loading' ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Connect Account"
                            )}
                        </QuestButton>
                    </div>
                </form>
            </QuestCard>

            {/* Linked Students List */}
            <QuestCard title="Your Students" icon={Users} color="slate" className="h-full">
                <div className="space-y-4">
                    {linkedStudents.length === 0 ? (
                        <div className="text-center py-12 text-slate-400">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="w-8 h-8 text-slate-300" />
                            </div>
                            <p className="font-medium">No students linked yet.</p>
                            <p className="text-sm mt-1">Use the code from your child's app to connect.</p>
                        </div>
                    ) : (
                        linkedStudents.map((student) => (
                            <div key={student.id} className="flex items-center justify-between p-4 bg-white border-2 border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-lg border-2 border-emerald-200">
                                        {student.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">{student.name}</h4>
                                        <p className="text-xs font-medium text-slate-500">{student.grade}</p>
                                    </div>
                                </div>
                                <div className="text-slate-300 group-hover:text-emerald-500 transition-colors">
                                    <Users className="w-6 h-6" />
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </QuestCard>
        </motion.div>
    );
}