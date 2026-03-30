import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import PlayerCard from './PlayerCard';

/**
 * FriendsList - Friends management with grid display
 * Shows online/offline friends, add friend, pending requests
 * 
 * @param {Object} props
 * @param {Array} props.friends - Friends list
 * @param {Array} props.pendingRequests - Pending friend requests
 * @param {function} props.onAddFriend - Add friend handler
 * @param {function} props.onAcceptRequest - Accept request handler
 * @param {function} props.onDeclineRequest - Decline request handler
 * @param {function} props.onInviteToStudy - Invite to study handler
 * @param {string} props.className - Additional CSS classes
 */
const FriendsList = ({
  friends = [],
  pendingRequests = [],
  onAddFriend,
  onAcceptRequest,
  onDeclineRequest,
  onInviteToStudy,
  className = '',
}) => {
  const [searchUsername, setSearchUsername] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, online, requests

  const defaultFriends = [
    { id: 1, name: 'STUDY_BUDDY_01', level: 45, power: 7800, status: 'online', specialty: 'MATH', lastSeen: null },
    { id: 2, name: 'BOOK_WARRIOR', level: 62, power: 10200, status: 'studying', specialty: 'ENGLISH', lastSeen: null },
    { id: 3, name: 'CODE_MAGE', level: 38, power: 5600, status: 'offline', specialty: 'SCIENCE', lastSeen: '2 hours ago' },
    { id: 4, name: 'PIXEL_SCHOLAR', level: 55, power: 8900, status: 'online', specialty: 'HISTORY', lastSeen: null },
    { id: 5, name: 'VOID_READER', level: 72, power: 12500, status: 'idle', specialty: 'MATH', lastSeen: null },
    { id: 6, name: 'NIGHT_OWL', level: 41, power: 7200, status: 'offline', specialty: 'GENERAL', lastSeen: '1 day ago' },
  ];

  const friendList = friends.length > 0 ? friends : defaultFriends;

  const defaultRequests = [
    { id: 101, name: 'QUEST_SEEKER', level: 28, power: 4200, specialty: 'SCIENCE' },
    { id: 102, name: 'KNOWLEDGE_HUNTER', level: 35, power: 5800, specialty: 'HISTORY' },
  ];

  const requests = pendingRequests.length > 0 ? pendingRequests : defaultRequests;

  // Filter friends based on tab
  const filteredFriends = friendList.filter(friend => {
    if (activeTab === 'online') return friend.status === 'online' || friend.status === 'studying';
    return true;
  });

  // Sort: online first, then by level
  const sortedFriends = [...filteredFriends].sort((a, b) => {
    if (a.status === 'offline' && b.status !== 'offline') return 1;
    if (a.status !== 'offline' && b.status === 'offline') return -1;
    return b.level - a.level;
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchUsername.trim()) {
      onAddFriend?.(searchUsername.trim());
      setSearchUsername('');
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Add Friend Section */}
      <div className="bg-surface-container border-2 border-outline-variant p-4 shadow-[4px_4px_0px_0px_#150136]">
        <h3 className="font-['Press_Start_2P'] text-[10px] text-secondary mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined">person_add</span>
          ADD FRIEND
        </h3>
        
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <input
            type="text"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            placeholder="Enter username..."
            className="flex-1 bg-surface-container-lowest border-2 border-outline-variant px-3 py-2 font-headline text-sm focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={!searchUsername.trim()}
            className="px-4 py-2 bg-primary-container text-on-primary-container font-['Press_Start_2P'] text-[10px] border-b-4 border-on-primary-fixed-variant active:translate-y-1 active:border-b-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">send</span>
              REQUEST
            </span>
          </button>
        </form>
      </div>

      {/* Pending Requests */}
      {requests.length > 0 && (
        <div className="bg-surface-container border-2 border-primary p-4 shadow-[4px_4px_0px_0px_#65002e]">
          <h3 className="font-['Press_Start_2P'] text-[10px] text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">notifications</span>
            PENDING REQUESTS ({requests.length})
          </h3>
          
          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request.id} className="flex items-center gap-4 p-3 bg-surface-container-high">
                <PlayerCard player={request} size="small" showStatus={false} />
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => onAcceptRequest?.(request.id)}
                    className="px-3 py-2 bg-secondary text-on-secondary font-['Press_Start_2P'] text-[6px] border-b-2 border-on-secondary active:translate-y-0.5 active:border-b-0 transition-all"
                  >
                    ACCEPT
                  </button>
                  <button
                    onClick={() => onDeclineRequest?.(request.id)}
                    className="px-3 py-2 bg-surface-container-high text-error font-['Press_Start_2P'] text-[6px] border border-error hover:bg-error hover:text-on-error transition-colors"
                  >
                    DECLINE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends Filter Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('all')}
          className={cn(
            "px-4 py-2 font-['Press_Start_2P'] text-[10px] border-b-4 active:translate-y-1 active:border-b-0 transition-all",
            activeTab === 'all'
              ? "bg-primary text-on-primary border-on-primary-fixed-variant"
              : "bg-surface-container text-on-surface-variant border-surface-container-high hover:text-primary"
          )}
        >
          ALL ({friendList.length})
        </button>
        <button
          onClick={() => setActiveTab('online')}
          className={cn(
            "px-4 py-2 font-['Press_Start_2P'] text-[10px] border-b-4 active:translate-y-1 active:border-b-0 transition-all",
            activeTab === 'online'
              ? "bg-secondary text-on-secondary border-on-secondary-fixed-variant"
              : "bg-surface-container text-on-surface-variant border-surface-container-high hover:text-secondary"
          )}
        >
          ONLINE ({friendList.filter(f => f.status !== 'offline').length})
        </button>
      </div>

      {/* Friends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedFriends.map((friend) => {
          const isOnline = friend.status !== 'offline';
          
          return (
            <div
              key={friend.id}
              className={cn(
                "bg-surface-container border-2 p-4 transition-all",
                isOnline 
                  ? "border-secondary shadow-[0_0_10px_rgba(0,241,254,0.1)]" 
                  : "border-outline-variant opacity-70 grayscale"
              )}
            >
              {/* Friend Info */}
              <PlayerCard 
                player={friend} 
                size="medium" 
                className="mb-3 bg-transparent border-none shadow-none"
              />

              {/* Last Seen (if offline) */}
              {!isOnline && friend.lastSeen && (
                <p className="font-['Press_Start_2P'] text-[6px] text-on-surface-variant mb-3">
                  Last seen {friend.lastSeen}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {isOnline ? (
                  <button
                    onClick={() => onInviteToStudy?.(friend.id)}
                    className="flex-1 py-2 bg-primary/20 text-primary font-['Press_Start_2P'] text-[8px] border border-primary hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm">sports_esports</span>
                    INVITE TO PARTY
                  </button>
                ) : (
                  <button
                    disabled
                    className="flex-1 py-2 bg-surface-container-high text-on-surface-variant font-['Press_Start_2P'] text-[8px] cursor-not-allowed"
                  >
                    OFFLINE
                  </button>
                )}
                
                <button
                  className="px-3 py-2 bg-surface-container-high text-on-surface-variant hover:text-error transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">more_vert</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {sortedFriends.length === 0 && (
        <div className="text-center py-12 bg-surface-container border-2 border-outline-variant border-dashed">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">group</span>
          <h3 className="font-['Press_Start_2P'] text-sm text-on-surface-variant mb-2">
            NO FRIENDS FOUND
          </h3>
          <p className="font-body text-sm text-on-surface-variant">
            {activeTab === 'online' 
              ? 'No friends are currently online.' 
              : 'Add friends to study together!'}
          </p>
        </div>
      )}
    </div>
  );
};

export default FriendsList;
