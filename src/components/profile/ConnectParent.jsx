import React, { useState } from 'react';
import { Share2, Copy, RefreshCw, Check } from 'lucide-react';

// NOTE: You will need to add the API call to your utils/api.js
// export const familyAPI = { generateCode: () => api.post('/family/generate-code') }

const ConnectParent = () => {
  const [code, setCode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Mock API call - Replace with actual API call
  const generateCode = async () => {
    setLoading(true);
    try {
        // const res = await familyAPI.generateCode();
        // setCode(res.data.code);
        
        // Simulation for now:
        setTimeout(() => {
            setCode(Math.random().toString(36).substring(2, 8).toUpperCase());
            setLoading(false);
        }, 800);
    } catch (err) {
        console.error(err);
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
    <div className="max-w-md mx-auto bg-pixel-dark border-4 border-pixel-accent p-6 shadow-pixel">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-900 rounded-full mb-4 border-4 border-blue-400">
          <Share2 className="w-8 h-8 text-blue-200" />
        </div>
        <h2 className="text-2xl font-pixel text-white mb-2">Link Parent</h2>
        <p className="text-gray-400 font-pixel text-xs">
          Generate a code to let your parent connect to your account.
        </p>
      </div>

      {!code ? (
        <button
          onClick={generateCode}
          disabled={loading}
          className="w-full py-4 bg-pixel-gold hover:bg-yellow-500 text-pixel-dark font-pixel border-4 border-white shadow-pixel transition-transform hover:-translate-y-1 active:translate-y-0"
        >
          {loading ? 'GENERATING...' : 'GENERATE CODE'}
        </button>
      ) : (
        <div className="animate-in fade-in zoom-in duration-300">
          <div className="bg-gray-800 border-2 border-dashed border-gray-500 p-6 mb-4 text-center relative">
            <span className="block text-gray-500 text-xs font-pixel mb-2">YOUR CODE</span>
            <span className="text-4xl font-mono font-bold text-white tracking-widest">
              {code}
            </span>
            <div className="mt-2 text-xs text-yellow-500 font-pixel">
              Expires in 15:00
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={copyToClipboard}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-pixel border-2 border-white"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'COPIED!' : 'COPY'}
            </button>
            <button
              onClick={generateCode}
              className="flex items-center justify-center px-4 bg-gray-700 hover:bg-gray-600 text-white border-2 border-gray-400"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectParent;