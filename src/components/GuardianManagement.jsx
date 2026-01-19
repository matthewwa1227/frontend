import React, { useState } from 'react';
import { 
  Shield, 
  Link as LinkIcon, 
  Copy, 
  AlertCircle, 
  User, 
  Check, 
  Loader2,
  Users
} from 'lucide-react';

function GuardianManagement() {
  const [inviteCode, setInviteCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // Mock data for guardians (currently empty based on your prompt)
  const [guardians, setGuardians] = useState([]);

  const generateCode = () => {
    setIsLoading(true);
    setError(null);
    setInviteCode(null);

    // Simulate API call delay
    setTimeout(() => {
      // Randomly simulating success or failure for demonstration
      // In production, this would be your actual API call
      const isSuccess = Math.random() > 0.1; // 90% success rate

      if (isSuccess) {
        setInviteCode("P7X-9K2-M4"); // Example code
        setIsLoading(false);
      } else {
        setError("Failed to generate code. Please try again.");
        setIsLoading(false);
      }
    }, 1500);
  };

  const copyToClipboard = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12 font-sans text-gray-800">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="text-indigo-600" size={32} />
            Parent Portal
          </h1>
          <p className="text-gray-600 text-lg">
            Manage your guardians and share your progress.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Card 1: Link New Guardian */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                <LinkIcon size={24} />
              </div>
              <h2 className="text-xl font-semibold">Link New Guardian</h2>
            </div>
            
            <p className="text-gray-500 mb-6 flex-grow">
              Generate a unique code to link a parent account. Share this code with your guardian.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 text-center space-y-4">
              {inviteCode ? (
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    Your Invite Code
                  </span>
                  <div className="text-3xl font-mono font-bold text-indigo-600 tracking-widest">
                    {inviteCode}
                  </div>
                  <button 
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "Copied!" : "Copy Code"}
                  </button>
                </div>
              ) : (
                <div className="py-2">
                   <p className="text-sm text-gray-400 italic mb-4">
                     Click below to generate
                   </p>
                </div>
              )}

              {/* Error State Display */}
              {error && (
                <div className="flex items-center justify-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </div>

            <button
              onClick={generateCode}
              disabled={isLoading || inviteCode}
              className={`
                mt-6 w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-all
                ${inviteCode 
                  ? 'bg-gray-100 text-gray-400 cursor-default' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'}
              `}
            >
              {isLoading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating...
                </>
              ) : inviteCode ? (
                "Code Active"
              ) : (
                "Generate Code"
              )}
            </button>
          </div>

          {/* Card 2: Connected Guardians */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-50 rounded-lg text-green-600">
                <Users size={24} />
              </div>
              <h2 className="text-xl font-semibold">Connected Guardians</h2>
            </div>

            <div className="flex-grow flex flex-col">
              {guardians.length > 0 ? (
                <ul className="space-y-3">
                  {guardians.map((guardian) => (
                    <li key={guardian.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{guardian.name}</p>
                        <p className="text-xs text-gray-500">{guardian.email}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center py-8 text-gray-400">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                    <User size={32} className="opacity-20" />
                  </div>
                  <p className="font-medium text-gray-500">No guardians connected yet.</p>
                  <p className="text-sm mt-1 max-w-xs">
                    Once a guardian links their account using your code, they will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3">
          <Shield className="text-blue-600 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Connected guardians can view your study stats, achievements, and current level progress. They cannot see your private messages or change your account password.
          </p>
        </div>

      </div>
    </div>
  );
}

export default GuardianManagement;