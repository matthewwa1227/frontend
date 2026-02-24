import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, Trophy, Plus, Search, X, ChevronRight,
  MessageCircle, Heart, Share2, Crown, Target, Flame
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const pixelText = { fontFamily: 'monospace' };

const SocialHub = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('groups');
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    subject: '',
    isPrivate: false,
    maxMembers: 10
  });
  const [friendUsername, setFriendUsername] = useState('');
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      if (activeTab === 'groups') {
        const res = await fetch(`${API_BASE}/api/social/groups`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setGroups(data.groups || []);
        }
      }
      
      if (activeTab === 'friends') {
        const [friendsRes, requestsRes] = await Promise.all([
          fetch(`${API_BASE}/api/social/friends`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`${API_BASE}/api/social/friends/requests`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (friendsRes.ok) {
          const data = await friendsRes.json();
          setFriends(data.friends || []);
        }
        if (requestsRes.ok) {
          const data = await requestsRes.json();
          setFriendRequests(data.requests || []);
        }
      }
      
      if (activeTab === 'challenges') {
        const res = await fetch(`${API_BASE}/api/social/challenges`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setChallenges(data.challenges || []);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createGroup = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/api/social/groups`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newGroup)
      });
      
      if (res.ok) {
        const data = await res.json();
        setShowCreateGroup(false);
        setNewGroup({ name: '', description: '', subject: '', isPrivate: false, maxMembers: 10 });
        fetchData();
        alert(`Group created! Join code: ${data.group.join_code}`);
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const joinGroup = async (groupId, code = '') => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/api/social/groups/${groupId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ joinCode: code })
      });
      
      if (res.ok) {
        fetchData();
        alert('Joined group successfully!');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to join group');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendFriendRequest = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const res = await fetch(`${API_BASE}/api/social/friends/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: friendUsername })
      });
      
      if (res.ok) {
        setShowAddFriend(false);
        setFriendUsername('');
        alert('Friend request sent!');
      } else {
        const error = await res.json();
        alert(error.message || 'Failed to send request');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const respondToRequest = async (requestId, action) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      await fetch(`${API_BASE}/api/social/friends/${requestId}/respond`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action })
      });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const joinChallenge = async (challengeId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      await fetch(`${API_BASE}/api/social/challenges/${challengeId}/join`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400" style={pixelText}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ ...pixelText, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            👥 SOCIAL HUB
          </h1>
          <p className="text-slate-400" style={pixelText}>
            Connect, collaborate, and compete with others
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <TabButton 
            active={activeTab === 'groups'} 
            onClick={() => setActiveTab('groups')} 
            icon={Users} 
            label="STUDY GROUPS" 
          />
          <TabButton 
            active={activeTab === 'friends'} 
            onClick={() => setActiveTab('friends')} 
            icon={UserPlus} 
            label="FRIENDS" 
            badge={friendRequests.length}
          />
          <TabButton 
            active={activeTab === 'challenges'} 
            onClick={() => setActiveTab('challenges')} 
            icon={Trophy} 
            label="CHALLENGES" 
          />
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'groups' && (
            <motion.div 
              key="groups"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {groups.map((group) => (
                <motion.div
                  key={group.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-slate-800 rounded-2xl p-6 border-2 border-slate-700 hover:border-pink-500 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl">
                      {group.subject === 'Mathematics' ? '📐' : 
                       group.subject === 'Science' ? '🔬' : 
                       group.subject === 'English' ? '📖' : 
                       group.subject === 'Chinese' ? '中文' : '📚'}
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block" style={pixelText}>
                        {group.member_count}/{group.max_members}
                      </span>
                      <span className="text-xs text-pink-400" style={pixelText}>
                        {group.is_private ? '🔒 Private' : '🌐 Public'}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2" style={pixelText}>{group.name}</h3>
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2" style={pixelText}>
                    {group.description || 'No description'}
                  </p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    {group.subject && (
                      <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded" style={pixelText}>
                        {group.subject}
                      </span>
                    )}
                  </div>

                  {group.is_member ? (
                    <button className="w-full py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      ENTER GROUP
                    </button>
                  ) : group.is_private ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Enter join code"
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
                        onChange={(e) => setJoinCode(e.target.value)}
                      />
                      <button 
                        onClick={() => joinGroup(group.id, joinCode)}
                        className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold"
                      >
                        JOIN WITH CODE
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => joinGroup(group.id)}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold"
                    >
                      JOIN GROUP
                    </button>
                  )}
                </motion.div>
              ))}

              {/* Create Group Card */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowCreateGroup(true)}
                className="p-6 rounded-2xl border-2 border-dashed border-slate-600 hover:border-pink-500 bg-slate-800/50 flex flex-col items-center justify-center min-h-[250px]"
              >
                <Plus className="w-16 h-16 text-slate-400 mb-4" />
                <span className="text-slate-400 font-bold" style={pixelText}>CREATE GROUP</span>
              </motion.button>
            </motion.div>
          )}

          {activeTab === 'friends' && (
            <motion.div
              key="friends"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Friend Requests */}
              {friendRequests.length > 0 && (
                <div className="bg-slate-800 rounded-2xl p-6 mb-6">
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2" style={pixelText}>
                    <UserPlus className="w-5 h-5 text-amber-400" />
                    FRIEND REQUESTS ({friendRequests.length})
                  </h2>
                  <div className="space-y-3">
                    {friendRequests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                            {req.username[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white font-bold" style={pixelText}>{req.username}</p>
                            <p className="text-slate-400 text-xs" style={pixelText}>Level {req.level}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => respondToRequest(req.id, 'accept')}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-sm"
                          >
                            ACCEPT
                          </button>
                          <button 
                            onClick={() => respondToRequest(req.id, 'decline')}
                            className="px-4 py-2 bg-slate-600 text-white rounded-lg font-bold text-sm"
                          >
                            DECLINE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Friends List */}
              <div className="bg-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white" style={pixelText}>YOUR FRIENDS</h2>
                  <button 
                    onClick={() => setShowAddFriend(true)}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg font-bold flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" /> ADD FRIEND
                  </button>
                </div>
                
                {friends.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400 mb-4" style={pixelText}>No friends yet</p>
                    <button 
                      onClick={() => setShowAddFriend(true)}
                      className="px-6 py-3 bg-pink-600 text-white rounded-lg font-bold"
                    >
                      ADD FIRST FRIEND
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {friends.map((friend) => (
                      <div key={friend.id} className="bg-slate-700 rounded-xl p-4 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full mx-auto mb-3 flex items-center justify-center text-xl font-bold text-white">
                          {(friend.friend_name || friend.friend_username)[0].toUpperCase()}
                        </div>
                        <h4 className="text-white font-bold truncate" style={pixelText}>
                          {friend.friend_name || friend.friend_username}
                        </h4>
                        <p className="text-slate-400 text-xs" style={pixelText}>Level {friend.friend_level}</p>
                        <div className="mt-3 pt-3 border-t border-slate-600">
                          <p className="text-emerald-400 text-xs" style={pixelText}>
                            <Flame className="w-3 h-3 inline mr-1" />
                            {friend.shared_study_minutes} min
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'challenges' && (
            <motion.div
              key="challenges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {challenges.map((challenge) => (
                <motion.div
                  key={challenge.id}
                  whileHover={{ scale: 1.01 }}
                  className="bg-slate-800 rounded-2xl p-6 border-2 border-slate-700"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center text-4xl">
                      🏆
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white" style={pixelText}>{challenge.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          challenge.difficulty === 'easy' ? 'bg-emerald-900 text-emerald-400' :
                          challenge.difficulty === 'medium' ? 'bg-amber-900 text-amber-400' :
                          'bg-rose-900 text-rose-400'
                        }`} style={pixelText}>
                          {challenge.difficulty.toUpperCase()}
                        </span>
                        <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded" style={pixelText}>
                          {challenge.challenge_type}
                        </span>
                      </div>
                      <p className="text-slate-400 mb-3" style={pixelText}>{challenge.description}</p>
                      <div className="flex items-center gap-6 text-sm">
                        <span className="text-amber-400 flex items-center gap-1" style={pixelText}>
                          <Target className="w-4 h-4" />
                          {challenge.target_value} {challenge.target_metric}
                        </span>
                        <span className="text-emerald-400 flex items-center gap-1" style={pixelText}>
                          <Trophy className="w-4 h-4" />
                          +{challenge.xp_reward} XP
                        </span>
                        <span className="text-blue-400 flex items-center gap-1" style={pixelText}>
                          <Users className="w-4 h-4" />
                          {challenge.participant_count || 0} participants
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {challenge.progress_percentage > 0 ? (
                        <>
                          <p className="text-3xl font-bold text-amber-400 mb-2" style={pixelText}>
                            {challenge.progress_percentage}%
                          </p>
                          <button className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold">
                            CONTINUE
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => joinChallenge(challenge.id)}
                          className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold"
                        >
                          JOIN
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  {challenge.progress_percentage > 0 && (
                    <div className="mt-4">
                      <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${challenge.progress_percentage}%` }}
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Group Modal */}
        {showCreateGroup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white" style={pixelText}>CREATE STUDY GROUP</h3>
                <button onClick={() => setShowCreateGroup(false)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Group Name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
                <textarea
                  placeholder="Description"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  rows={3}
                />
                <select
                  value={newGroup.subject}
                  onChange={(e) => setNewGroup({...newGroup, subject: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="">Select Subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Science">Science</option>
                  <option value="English">English</option>
                  <option value="Chinese">Chinese</option>
                  <option value="History">History</option>
                </select>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={newGroup.isPrivate}
                    onChange={(e) => setNewGroup({...newGroup, isPrivate: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isPrivate" className="text-slate-300 text-sm" style={pixelText}>Private Group</label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCreateGroup(false)} className="flex-1 py-2 bg-slate-700 text-white rounded-lg font-bold">
                  CANCEL
                </button>
                <button 
                  onClick={createGroup}
                  disabled={!newGroup.name}
                  className="flex-1 py-2 bg-pink-600 text-white rounded-lg font-bold disabled:opacity-50"
                >
                  CREATE
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Add Friend Modal */}
        {showAddFriend && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div className="bg-slate-800 rounded-2xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white" style={pixelText}>ADD FRIEND</h3>
                <button onClick={() => setShowAddFriend(false)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Enter username"
                  value={friendUsername}
                  onChange={(e) => setFriendUsername(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddFriend(false)} className="flex-1 py-2 bg-slate-700 text-white rounded-lg font-bold">
                  CANCEL
                </button>
                <button 
                  onClick={sendFriendRequest}
                  disabled={!friendUsername}
                  className="flex-1 py-2 bg-pink-600 text-white rounded-lg font-bold disabled:opacity-50"
                >
                  SEND REQUEST
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label, badge = 0 }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${
      active 
        ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg' 
        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
    }`}
    style={pixelText}
  >
    <Icon className="w-5 h-5" />
    {label}
    {badge > 0 && (
      <span className="ml-2 px-2 py-0.5 bg-amber-500 text-white text-xs rounded-full">
        {badge}
      </span>
    )}
  </button>
);

export default SocialHub;
