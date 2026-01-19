import React, { useState } from 'react';
import { 
  Link as LinkIcon, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Users,
  Copy
} from 'lucide-react';

// --- MOCK SUPABASE CLIENT FOR DEMONSTRATION ---
// This mock simulates the backend responses so the UI works without a real backend connection.
const mockSupabase = {
  auth: {
    getUser: async () => ({ data: { user: { id: 'user-123', role: 'student' } } }),
  },
  rpc: async (funcName, params) => {
    if (funcName === 'link_parent_with_code') {
      // Simulate linking logic
      if (params.input_code === '123456') {
        return { data: { success: true, student_id: 'student-999' }, error: null };
      }
      return { data: { success: false, message: 'Invalid code' }, error: null };
    }
    return { data: null, error: null };
  },
  from: (table) => ({
    insert: async () => ({ error: null }),
    select: () => ({
      eq: () => ({
        single: async () => ({ data: { code: '123456', expires_at: new Date(Date.now() + 900000).toISOString() }, error: null }),
        data: [{ id: 'link-1', student: { full_name: 'Alice Student' } }]
      })
    })
  })
};

// We use the mock for now. In production, you would import the real client.
const supabase = mockSupabase; 

const ParentStudentPortal = () => {
  const [userRole, setUserRole] = useState('student'); // Toggle this to 'parent' to test other view
  const [loading, setLoading] = useState(false);

  // --- STUDENT STATE ---
  const [generatedCode, setGeneratedCode] = useState(null);
  const [expiryTime, setExpiryTime] = useState(null);

  // --- PARENT STATE ---
  const [inputCode, setInputCode] = useState('');
  const [linkStatus, setLinkStatus] = useState({ type: '', message: '' });
  const [linkedStudents, setLinkedStudents] = useState([
    { id: 1, name: 'Alice Smith', grade: '10th' },
    { id: 2, name: 'Bob Smith', grade: '8th' }
  ]);

  // --- STUDENT ACTIONS ---
  const generateCode = async () => {
    setLoading(true);
    
    // Simulation of API call delay
    setTimeout(() => {
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(newCode);
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + 15); // 15 mins from now
      setExpiryTime(expiry);
      setLoading(false);
    }, 800);
  };

  // --- PARENT ACTIONS ---
  const handleLinkAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLinkStatus({ type: '', message: '' });

    // Simulation of API call delay and validation
    setTimeout(() => {
      if (inputCode.length === 6) {
        setLinkStatus({ type: 'success', message: 'Successfully linked to student account!' });
        setLinkedStudents(prev => [...prev, { id: 3, name: 'New Student', grade: '9th' }]);
        setInputCode('');
      } else {
        setLinkStatus({ type: 'error', message: 'Invalid or expired code. Please try again.' });
      }
      setLoading(false);
    }, 1000);
  };

  const copyToClipboard = () => {
    if(generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      alert("Code copied!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center font-sans">
      
      {/* Role Switcher for Demo Purposes */}
      <div className="mb-8 bg-white p-2 rounded-lg shadow-sm border border-slate-200 flex gap-2">
        <button 
          onClick={() => setUserRole('student')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${userRole === 'student' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          View as Student
        </button>
        <button 
          onClick={() => setUserRole('parent')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${userRole === 'parent' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          View as Parent
        </button>
      </div>

      <div className="w-full max-w-md">
        {userRole === 'student' ? (
          /* --- STUDENT VIEW --- */
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Connect Parent</h1>
              <p className="text-slate-500 mt-2">Generate a code to let your parent link to your account.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6">
                {!generatedCode ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LinkIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No Active Code</h3>
                    <p className="text-slate-500 text-sm mb-6">
                      Create a temporary code. Share it with your parent to give them access.
                    </p>
                    <button 
                      onClick={generateCode}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                      Generate Connection Code
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Your Connection Code</p>
                    
                    <div className="bg-slate-100 rounded-lg p-6 mb-4 relative group cursor-pointer" onClick={copyToClipboard}>
                      <span className="text-4xl font-mono font-bold text-slate-800 tracking-widest">
                        {generatedCode}
                      </span>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <Copy className="w-6 h-6 text-slate-600" />
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-amber-600 text-sm font-medium bg-amber-50 py-2 rounded-md mb-6">
                      <RefreshCw className="w-4 h-4" />
                      Expires at {expiryTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </div>

                    <button 
                      onClick={generateCode}
                      className="text-slate-500 hover:text-slate-700 text-sm font-medium underline decoration-slate-300 underline-offset-4"
                    >
                      Generate New Code
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
                <p className="text-xs text-slate-500 text-center">
                  This code grants read-only access to your grades and attendance.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* --- PARENT VIEW --- */
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900">Parent Dashboard</h1>
              <p className="text-slate-500 mt-2">Manage your linked students.</p>
            </div>

            {/* Link New Student Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-indigo-600" />
                Link New Student
              </h3>
              
              <form onSubmit={handleLinkAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Enter Connection Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-center text-lg tracking-widest font-mono"
                  />
                </div>

                {linkStatus.message && (
                  <div className={`p-3 rounded-md flex items-start gap-2 text-sm ${
                    linkStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {linkStatus.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    {linkStatus.message}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || inputCode.length !== 6}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg transition-all"
                >
                  {loading ? 'Linking...' : 'Connect Student'}
                </button>
              </form>
            </div>

            {/* Linked Students List */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  Your Students
                </h3>
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">
                  {linkedStudents.length}
                </span>
              </div>
              
              <div className="divide-y divide-slate-100">
                {linkedStudents.map((student) => (
                  <div key={student.id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.grade} Grade</p>
                      </div>
                    </div>
                    <div className="text-slate-400 group-hover:text-indigo-600 transition-colors text-sm font-medium">
                      View Details →
                    </div>
                  </div>
                ))}
                
                {linkedStudents.length === 0 && (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No students linked yet. Use the form above to add one.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentStudentPortal;