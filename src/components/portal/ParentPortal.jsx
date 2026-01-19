import React, { useState } from 'react';
import { Link2, Shield, AlertCircle, Copy, Check, RefreshCw } from 'lucide-react';

const ParentPortal = () => {
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // Mock data for guardians - currently empty based on your prompt
  const [guardians, setGuardians] = useState([]);

  const generateCode = () => {
    setIsLoading(true);
    setError(null);
    setGeneratedCode(null);

    // Simulate API call
    setTimeout(() => {
      // 30% chance to fail to demonstrate the error state you requested
      const shouldFail = Math.random() < 0.3;

      if (shouldFail) {
        setError("Failed to generate code. Please try again.");
        setIsLoading(false);
      } else {
        // Generate random 6-character code
        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        setGeneratedCode(randomCode);
        setIsLoading(false);
      }
    }, 1500);
  };

  const copyToClipboard = () => {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 md:p-8 font-mono text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="space-y-2 border-b-4 border-white pb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-yellow-400">
            Parent Portal
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Manage your guardians and share your progress.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          
          {/* Link New Guardian Section */}
          <div className="bg-gray-800 border-4 border-white p-6 relative shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-600 border-2 border-white">
                <Link2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold">Link New Guardian</h2>
            </div>
            
            <p className="text-gray-400 text-sm mb-6">
              Generate a unique code to link a parent account.
            </p>

            <div className="space-y-4">
              {!generatedCode && !isLoading && (
                <button
                  onClick={generateCode}
                  className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-black font-bold border-4 border-transparent hover:border-white transition-all active:translate-y-1"
                >
                  Click below to generate
                </button>
              )}

              {isLoading && (
                <div className="flex flex-col items-center justify-center py-8 space-y-3 border-2 border-dashed border-gray-600 bg-gray-900/50">
                  <RefreshCw className="w-8 h-8 animate-spin text-yellow-400" />
                  <span className="text-xs text-gray-500">Generating secure key...</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-900/30 border-2 border-red-500 text-red-200 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                  <button 
                    onClick={generateCode}
                    className="ml-auto text-xs underline hover:text-white"
                  >
                    Retry
                  </button>
                </div>
              )}

              {generatedCode && (
                <div className="bg-gray-900 border-4 border-blue-500 p-6 text-center animate-in fade-in slide-in-from-bottom-4">
                  <span className="block text-xs text-blue-400 mb-2 uppercase tracking-widest">Share this code</span>
                  <div className="text-4xl font-black tracking-wider text-white mb-4 font-mono">
                    {generatedCode}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold border-2 border-blue-400 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy Code"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Connected Guardians Section */}
          <div className="bg-gray-800 border-4 border-white p-6 flex flex-col h-full shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-600 border-2 border-white">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-xl font-bold">Connected Guardians</h2>
            </div>

            <div className="flex-grow">
              {guardians.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-gray-600 bg-gray-900/30">
                  <Shield className="w-12 h-12 mb-3 opacity-20" />
                  <p>No guardians connected yet.</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {guardians.map((guardian) => (
                    <li key={guardian.id} className="flex items-center justify-between p-3 bg-gray-700 border-2 border-gray-600">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                          {guardian.name[0]}
                        </div>
                        <span className="font-bold">{guardian.name}</span>
                      </div>
                      <span className="text-xs bg-green-900 text-green-200 px-2 py-1 rounded">Active</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="mt-6 pt-4 border-t-2 border-gray-700">
              <p className="text-xs text-gray-400 leading-relaxed">
                <span className="text-yellow-400 font-bold">Note:</span> Connected guardians can view your study stats, achievements, and current level progress.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ParentPortal;