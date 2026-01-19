import React, { useState, useEffect } from 'react';
import { Users, Key, Shield, RefreshCw, Copy, Check } from 'lucide-react';
import { studentAPI } from '../../utils/api'; // We will update this next
import PixelCard from '../shared/PixelCard';

export default function ParentPortal() {
  const [loading, setLoading] = useState(true);
  const [parents, setParents] = useState([]);
  const [inviteCode, setInviteCode] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = async () => {
    try {
      setLoading(true);
      // Assuming this endpoint exists or will exist
      const response = await studentAPI.getConnectedParents();
      setParents(response.data.parents || []);
    } catch (err) {
      console.error("Failed to fetch parents", err);
      // Fallback for demo if API isn't ready yet
      setParents([]); 
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async () => {
    try {
      setInviteCode('Loading...');
      const response = await studentAPI.generateParentCode();
      setInviteCode(response.data.code);
      setCopied(false);
    } catch (err) {
      setError('Failed to generate code');
      setInviteCode(null);
    }
  };

  const copyToClipboard = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-pixel text-white mb-2 flex items-center gap-3">
          <Users className="w-8 h-8 text-pixel-gold" />
          Parent Portal
        </h1>
        <p className="text-sm font-pixel text-gray-400">
          Manage your guardians and share your progress.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Generate Code */}
        <PixelCard title="Link New Guardian" icon="🔗">
          <div className="text-center py-6">
            <div className="bg-pixel-dark border-4 border-pixel-accent p-6 mb-6 inline-block rounded-full">
              <Key className="w-12 h-12 text-pixel-gold mx-auto" />
            </div>
            
            <p className="text-white font-pixel text-sm mb-4">
              Generate a unique code to link a parent account.
            </p>

            {inviteCode ? (
              <div className="bg-gray-800 p-4 border-2 border-dashed border-gray-600 mb-4 relative group">
                <p className="text-3xl font-mono text-white tracking-widest font-bold">
                  {inviteCode}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Code expires in 15 minutes
                </p>
                <button 
                  onClick={copyToClipboard}
                  className="absolute top-2 right-2 p-2 hover:bg-gray-700 rounded transition-colors"
                  title="Copy Code"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-white" />}
                </button>
              </div>
            ) : (
              <div className="h-24 flex items-center justify-center text-gray-500 text-xs font-mono mb-4 border-2 border-transparent">
                Click below to generate
              </div>
            )}

            {error && (
              <p className="text-red-400 text-xs font-pixel mb-4">{error}</p>
            )}

            <button
              onClick={generateCode}
              className="w-full bg-pixel-primary border-4 border-white py-3 font-pixel text-sm text-white hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {inviteCode ? 'Generate New Code' : 'Generate Access Code'}
            </button>
          </div>
        </PixelCard>

        {/* Right Column: Connected Parents */}
        <PixelCard title="Connected Guardians" icon="🛡️">
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-pixel-gold border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : parents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="font-pixel text-xs">No guardians connected yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {parents.map((parent) => (
                <div 
                  key={parent.id} 
                  className="bg-pixel-dark border-2 border-pixel-accent p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-900 flex items-center justify-center border-2 border-indigo-500">
                      <span className="font-pixel text-white text-lg">
                        {parent.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-pixel text-sm text-white">{parent.username}</p>
                      <p className="text-xs font-mono text-gray-400">Connected</p>
                    </div>
                  </div>
                  <div className="text-green-400">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded">
            <p className="text-xs text-blue-200 font-mono">
              <span className="font-bold">Note:</span> Connected guardians can view your study stats, achievements, and current level progress.
            </p>
          </div>
        </PixelCard>
      </div>
    </div>
  );
}