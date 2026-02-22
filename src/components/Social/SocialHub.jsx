import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, MessageCircle, Trophy, Plus, Search, Heart } from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const pixelText = { fontFamily: 'monospace' };

const SocialHub = () => {
  const [activeTab, setActiveTab] = useState('groups');
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const [groupsRes, friendsRes, challengesRes] = await Promise.all([
        fetch(`${API_BASE}/api/social/groups`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/social/friends`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/api/social/challenges`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (groupsRes.ok) {
        const groupsData = await groupsRes.json();
        setGroups(groupsData.groups || []);
      }
      if (friendsRes.ok) {
        const friendsData = await friendsRes.json();
        setFriends(friendsData.friends || []);
      }
      if (challengesRes.ok) {
        const challengesData = await challengesRes.json();
        setChallenges(challengesData.challenges || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-400" style={pixelText}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8" style={pixelText}>
          👥 SOCIAL HUB
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <TabButton active={activeTab === 'groups'} onClick={() => setActiveTab('groups')} icon={Users} label="STUDY GROUPS" />
          <TabButton active={activeTab === 'friends'} onClick={() => setActiveTab('friends')} icon={UserPlus} label="FRIENDS" />
          <TabButton active={activeTab === 'challenges'} onClick={() => setActiveTab('challenges')} icon={Trophy} label="CHALLENGES" />
        </div>

        {/* Content */}
        {activeTab === 'groups' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {groups.map((group) => (
              <motion.div
                key={group.id}
                whileHover={{ scale: 1.02 }}
                className="bg-slate-800 rounded-xl p-6 border-2 border-slate-700 hover:border-blue-500"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-2xl">
                    {group.subject === 'Math' ? '📐' : group.subject === 'Science' ? '🔬' : '📚'}
                  </div>
                  <span className="text-xs text-slate-400" style={pixelText}>
                    {group.member_count}/{group.max_members} members
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2" style={pixelText}>{group.name}</h3>
                <p className="text-slate-400 text-sm mb-4" style={pixelText}>{group.description}</p>
                <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold">
                  {group.is_member ? 'ENTER' : 'JOIN'}
                </button>
              </motion.div>
            ))}
            
            {/* Create Group Card */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              className="p-6 rounded-xl border-2 border-dashed border-slate-600 hover:border-blue-500 bg-slate-800/50 flex flex-col items-center justify-center"
            >
              <Plus className="w-12 h-12 text-slate-400 mb-2" />
              <span className="text-slate-400 font-bold" style={pixelText}>CREATE GROUP</span>
            </motion.button>
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="bg-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white" style={pixelText}>YOUR FRIENDS</h2>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> ADD FRIEND
              </button>
            </div>
            
            {friends.length === 0 ? (
              <p className="text-slate-400 text-center py-8" style={pixelText}>No friends yet. Add your first friend!</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {friends.map((friend) => (
                  <div key={friend.id} className="bg-slate-700 rounded-xl p-4 text-center">
                    <div className="w-16 h-16 bg-purple-500 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white">
                      {friend.friend_name?.[0] || friend.friend_username[0]}
                    </div>
                    <h4 className="text-white font-bold" style={pixelText}>{friend.friend_name || friend.friend_username}</h4>
                    <p className="text-slate-400 text-xs" style={pixelText}>Level {friend.friend_level}</p>
                    <p className="text-emerald-400 text-xs mt-2" style={pixelText}>
                      {friend.shared_study_minutes} min together
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'challenges' && (
          <div className="space-y-4">
            {challenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                whileHover={{ scale: 1.01 }}
                className="bg-slate-800 rounded-xl p-6 border-2 border-slate-700"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-2xl">
                      🏆
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white" style={pixelText}>{challenge.title}</h3>
                      <p className="text-slate-400 text-sm" style={pixelText}>{challenge.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-blue-400" style={pixelText}>{challenge.challenge_type}</span>
                        <span className="text-xs text-emerald-400" style={pixelText}>+{challenge.xp_reward} XP</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-amber-400" style={pixelText}>
                      {challenge.progress_percentage || 0}%
                    </p>
                    <button className="mt-2 px-4 py-1 bg-amber-600 text-white rounded text-sm font-bold">
                      {challenge.progress_percentage ? 'CONTINUE' : 'JOIN'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors ${
      active 
        ? 'bg-blue-600 text-white' 
        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
    }`}
    style={pixelText}
  >
    <Icon className="w-5 h-5" />
    {label}
  </button>
);

export default SocialHub;
