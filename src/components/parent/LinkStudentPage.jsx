import React, { useState } from 'react';
import { KeyRound, ArrowRight, CheckCircle, XCircle, Loader2 } from 'lucide-react';

// You might pass parentId from your AuthContext or UserSession
const ParentLinkInput = ({ parentId = "current-logged-in-parent-uuid" }) => {
  const [inputCode, setInputCode] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [linkedStudent, setLinkedStudent] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (inputCode.length < 6) {
      setStatus('error');
      setErrorMessage('Code must be 6 characters long.');
      return;
    }

    setStatus('loading');

    try {
      // 1. Call your API endpoint
      const response = await fetch('/api/link-student', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: inputCode, 
          parentId: parentId 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to link account');
      }

      // 2. Success: Update UI with the student name returned from DB
      setStatus('success');
      setLinkedStudent(data.student); // Expecting { name: "Student Name", ... }

    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message || 'Invalid or expired code.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 font-mono text-white">
      <div className="w-full max-w-md">
        
        <div className="bg-gray-800 border-4 border-white p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 border-4 border-white rounded-full mb-4">
              <KeyRound className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-yellow-400 uppercase tracking-wider">Link Student</h1>
            <p className="text-gray-400 text-sm mt-2">Enter the code from the student's portal.</p>
          </div>

          {status === 'success' ? (
            <div className="bg-green-900/30 border-2 border-green-500 p-6 text-center animate-in fade-in zoom-in duration-300">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white mb-1">Success!</h3>
              <p className="text-green-200 mb-4">
                You are now linked to <span className="font-bold text-white">{linkedStudent?.full_name || "your student"}</span>.
              </p>
              <button 
                onClick={() => { setStatus('idle'); setInputCode(''); }}
                className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-bold border-2 border-transparent hover:border-white transition-all"
              >
                Link Another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="code" className="block text-xs font-bold uppercase text-gray-400">
                  6-Character Code
                </label>
                <input
                  type="text"
                  id="code"
                  maxLength={6}
                  value={inputCode}
                  onChange={(e) => {
                    setInputCode(e.target.value.toUpperCase());
                    if(status === 'error') setStatus('idle');
                  }}
                  placeholder="XY78Z9"
                  className="w-full bg-gray-900 border-4 border-gray-600 focus:border-yellow-400 text-white text-2xl font-black text-center py-4 tracking-[0.5em] placeholder:tracking-normal placeholder:text-gray-700 outline-none transition-colors"
                />
              </div>

              {status === 'error' && (
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 border-l-4 border-red-500 animate-in slide-in-from-left-2">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'loading' || inputCode.length === 0}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold text-lg border-4 border-transparent hover:border-white transition-all active:translate-y-1 flex items-center justify-center gap-2 group"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Connect Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentLinkInput;