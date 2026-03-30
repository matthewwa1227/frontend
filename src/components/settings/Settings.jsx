import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { getUser, clearAuth } from '../../utils/auth';
import { authAPI, studentAPI } from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';

// Layout Components
import TopAppBar from '../layout/TopAppBar';
import SideNavBar, { BottomNavBar } from '../layout/SideNavBar';

// UI Components
import PixelCard from '../ui/PixelCard';
import PixelButton from '../ui/PixelButton';

/**
 * Settings Page - Complete settings functionality for StudyQuest
 * Includes: Profile, Notifications, Appearance, Account, Privacy
 */
const Settings = () => {
  const navigate = useNavigate();
  const currentUser = getUser();
  const { 
    isPixelMode, 
    togglePixelMode, 
    animationsEnabled, 
    toggleAnimations,
    reducedMotion 
  } = useTheme();
  
  // State
  const [user, setUser] = useState(currentUser);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    bio: currentUser?.bio || '',
    formLevel: currentUser?.formLevel || currentUser?.form_level || 'S4',
    school: currentUser?.school || '',
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    dailyReminder: true,
    streakWarning: true,
    achievementUnlocked: true,
    friendActivity: false,
    challengeInvites: true,
    parentUpdates: true,
    emailDigest: false,
  });
  
  const [privacySettings, setPrivacySettings] = useState({
    publicProfile: false,
    showOnLeaderboard: true,
    allowFriendRequests: true,
    shareProgressWithParents: true,
    allowAIAnalysis: true,
  });

  // Navigation items
  const navItems = [
    { id: 'study', label: 'STUDY', icon: 'menu_book', href: '/dashboard' },
    { id: 'tasks', label: 'TASKS', icon: 'checklist', href: '/tasks' },
    { id: 'ai-tutor', label: 'AI TUTOR', icon: 'smart_toy', href: '/study-buddy' },
    { id: 'social', label: 'SOCIAL', icon: 'groups', href: '/social' },
    { id: 'progress', label: 'PROGRESS', icon: 'trending_up', href: '/progress' },
  ];

  // Load saved preferences from localStorage
  useEffect(() => {
    const savedNotifications = localStorage.getItem('sq_notification_settings');
    const savedPrivacy = localStorage.getItem('sq_privacy_settings');
    
    if (savedNotifications) {
      setNotificationSettings(JSON.parse(savedNotifications));
    }
    if (savedPrivacy) {
      setPrivacySettings(JSON.parse(savedPrivacy));
    }
  }, []);

  // Fetch latest user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await authAPI.getProfile();
        if (res.data) {
          setUser(res.data);
          setProfileForm(prev => ({
            ...prev,
            username: res.data.username || prev.username,
            email: res.data.email || prev.email,
            bio: res.data.bio || prev.bio,
            formLevel: res.data.formLevel || res.data.form_level || prev.formLevel,
            school: res.data.school || prev.school,
          }));
        }
      } catch (err) {
        console.log('Using cached user data');
      }
    };
    fetchUserData();
  }, []);

  // Save profile changes
  const handleSaveProfile = async () => {
    setLoading(true);
    setSaveStatus(null);
    
    try {
      await studentAPI.updateProfile(profileForm);
      
      // Update local storage
      const updatedUser = { ...currentUser, ...profileForm };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setSaveStatus({ type: 'success', message: 'Profile updated successfully!' });
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
      setTimeout(() => setSaveStatus(null), 3000);
    }
  };

  // Save notification settings
  const handleSaveNotifications = () => {
    localStorage.setItem('sq_notification_settings', JSON.stringify(notificationSettings));
    setSaveStatus({ type: 'success', message: 'Notification preferences saved!' });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Save privacy settings
  const handleSavePrivacy = () => {
    localStorage.setItem('sq_privacy_settings', JSON.stringify(privacySettings));
    setSaveStatus({ type: 'success', message: 'Privacy settings saved!' });
    setTimeout(() => setSaveStatus(null), 3000);
  };

  // Handle logout
  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      '⚠️ WARNING: This action cannot be undone!\n\n' +
      'All your progress, achievements, and data will be permanently deleted.\n\n' +
      'Are you absolutely sure you want to delete your account?'
    );
    
    if (confirmed) {
      const doubleConfirm = window.prompt('Type "DELETE" to confirm account deletion:');
      if (doubleConfirm === 'DELETE') {
        try {
          // Call delete account API (implement in backend)
          // await authAPI.deleteAccount();
          clearAuth();
          navigate('/login');
        } catch (err) {
          setSaveStatus({ type: 'error', message: 'Failed to delete account. Please contact support.' });
        }
      }
    }
  };

  // Settings sections
  const settingsSections = [
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'appearance', label: 'Appearance', icon: 'palette' },
    { id: 'notifications', label: 'Notifications', icon: 'notifications' },
    { id: 'privacy', label: 'Privacy', icon: 'security' },
    { id: 'account', label: 'Account', icon: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <TopAppBar 
        title="SETTINGS" 
        user={user}
        onMenuClick={() => setMobileMenuOpen(true)}
      />
      
      {/* Side Navigation (Desktop) */}
      <SideNavBar 
        items={navItems} 
        user={user}
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <main className="md:ml-64 pt-24 px-6 pb-24 min-h-screen">
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-['Press_Start_2P'] text-2xl text-primary mb-2">HERO CONFIGURATION</h1>
            <p className="text-on-surface-variant">Customize your StudyQuest experience</p>
          </div>

          {/* Save Status Toast */}
          {saveStatus && (
            <div className={cn(
              "fixed top-24 right-6 z-50 px-6 py-4 border-2 shadow-lg font-['Press_Start_2P'] text-[10px] transition-all",
              saveStatus.type === 'success' 
                ? 'bg-tertiary-container border-tertiary text-on-tertiary-container' 
                : 'bg-error-container border-error text-on-error-container'
            )}>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined">
                  {saveStatus.type === 'success' ? 'check_circle' : 'error'}
                </span>
                {saveStatus.message}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Settings Navigation */}
            <div className="lg:col-span-1">
              <PixelCard className="sticky top-24">
                <nav className="space-y-2">
                  {settingsSections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 font-['Press_Start_2P'] text-[10px] uppercase transition-all",
                        activeSection === section.id
                          ? "bg-primary-container text-on-primary-container shadow-[3px_3px_0px_0px_#ff4a8d]"
                          : "text-on-surface-variant hover:bg-surface-container-high"
                      )}
                    >
                      <span className="material-symbols-outlined">{section.icon}</span>
                      {section.label}
                    </button>
                  ))}
                </nav>
              </PixelCard>
            </div>

            {/* Settings Content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Profile Section */}
              {activeSection === 'profile' && (
                <PixelCard>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="material-symbols-outlined text-primary text-2xl">person</span>
                      <h2 className="font-['Press_Start_2P'] text-lg text-on-surface">PROFILE SETTINGS</h2>
                    </div>

                    <div className="space-y-6">
                      {/* Avatar Section */}
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 border-4 border-tertiary bg-surface-container shadow-[4px_4px_0px_0px_#4c3f00] flex items-center justify-center">
                          <span className="material-symbols-outlined text-4xl text-tertiary">
                            {user?.rpgClass === 'mage' ? 'auto_fix_high' : 
                             user?.rpgClass === 'warrior' ? 'sports_martial_arts' :
                             user?.rpgClass === 'archer' ? 'gesture' : 'school'}
                          </span>
                        </div>
                        <div>
                          <p className="font-['Press_Start_2P'] text-[10px] text-on-surface-variant mb-2">HERO AVATAR</p>
                          <PixelButton variant="secondary" size="sm">
                            CHANGE AVATAR
                          </PixelButton>
                        </div>
                      </div>

                      {/* Form Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="Hero Name"
                          value={profileForm.username}
                          onChange={(v) => setProfileForm({...profileForm, username: v})}
                          placeholder="Your username"
                        />
                        <FormField
                          label="Email"
                          value={profileForm.email}
                          onChange={(v) => setProfileForm({...profileForm, email: v})}
                          placeholder="your@email.com"
                          type="email"
                        />
                        <FormField
                          label="Form Level"
                          value={profileForm.formLevel}
                          onChange={(v) => setProfileForm({...profileForm, formLevel: v})}
                          type="select"
                          options={['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6']}
                        />
                        <FormField
                          label="School"
                          value={profileForm.school}
                          onChange={(v) => setProfileForm({...profileForm, school: v})}
                          placeholder="Your school name"
                        />
                      </div>

                      <FormField
                        label="Bio"
                        value={profileForm.bio}
                        onChange={(v) => setProfileForm({...profileForm, bio: v})}
                        placeholder="Tell us about your learning journey..."
                        type="textarea"
                      />

                      <div className="flex justify-end">
                        <PixelButton 
                          onClick={handleSaveProfile} 
                          variant="primary"
                          disabled={loading}
                        >
                          {loading ? 'SAVING...' : 'SAVE PROFILE'}
                        </PixelButton>
                      </div>
                    </div>
                  </div>
                </PixelCard>
              )}

              {/* Appearance Section */}
              {activeSection === 'appearance' && (
                <PixelCard>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="material-symbols-outlined text-primary text-2xl">palette</span>
                      <h2 className="font-['Press_Start_2P'] text-lg text-on-surface">APPEARANCE</h2>
                    </div>

                    <div className="space-y-6">
                      {/* Pixel Mode Toggle */}
                      <SettingToggle
                        label="Pixel Art Mode"
                        description="Enable retro pixel-art styling throughout the app"
                        icon="grid_on"
                        checked={isPixelMode}
                        onChange={togglePixelMode}
                      />

                      {/* Animations Toggle */}
                      <SettingToggle
                        label="Animations"
                        description="Enable animations and visual effects"
                        icon="animation"
                        checked={animationsEnabled}
                        onChange={toggleAnimations}
                        disabled={reducedMotion}
                      />

                      {reducedMotion && (
                        <div className="p-4 bg-tertiary-container/30 border border-tertiary text-on-surface-variant text-sm">
                          <span className="material-symbols-outlined inline mr-2">info</span>
                          System reduced motion preference is enabled. Some animations are disabled.
                        </div>
                      )}

                      {/* Theme Preview */}
                      <div className="mt-6">
                        <p className="font-['Press_Start_2P'] text-[10px] text-on-surface-variant mb-4">PREVIEW</p>
                        <div className={cn(
                          "p-6 border-2 transition-all",
                          isPixelMode 
                            ? "bg-surface-container border-outline-variant shadow-[4px_4px_0px_0px_#150136]" 
                            : "bg-gray-100 border-gray-300 rounded-lg shadow-lg"
                        )}>
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-12 h-12 flex items-center justify-center",
                              isPixelMode ? "bg-primary-container border-2 border-primary" : "bg-blue-500 rounded-full"
                            )}>
                              <span className="material-symbols-outlined text-primary">school</span>
                            </div>
                            <div>
                              <p className={cn(
                                "font-bold",
                                isPixelMode ? "font-['Press_Start_2P'] text-xs" : "font-sans"
                              )}>
                                Preview Text
                              </p>
                              <p className="text-sm text-on-surface-variant">This is how your interface looks</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </PixelCard>
              )}

              {/* Notifications Section */}
              {activeSection === 'notifications' && (
                <PixelCard>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="material-symbols-outlined text-primary text-2xl">notifications</span>
                      <h2 className="font-['Press_Start_2P'] text-lg text-on-surface">NOTIFICATIONS</h2>
                    </div>

                    <div className="space-y-4">
                      <SettingToggle
                        label="Daily Study Reminder"
                        description="Get reminded to study at your preferred time"
                        icon="schedule"
                        checked={notificationSettings.dailyReminder}
                        onChange={(v) => setNotificationSettings({...notificationSettings, dailyReminder: v})}
                      />

                      <SettingToggle
                        label="Streak Warning"
                        description="Alert when your streak is about to break"
                        icon="local_fire_department"
                        checked={notificationSettings.streakWarning}
                        onChange={(v) => setNotificationSettings({...notificationSettings, streakWarning: v})}
                      />

                      <SettingToggle
                        label="Achievement Unlocked"
                        description="Celebrate when you earn new badges"
                        icon="emoji_events"
                        checked={notificationSettings.achievementUnlocked}
                        onChange={(v) => setNotificationSettings({...notificationSettings, achievementUnlocked: v})}
                      />

                      <SettingToggle
                        label="Friend Activity"
                        description="See when friends complete quests"
                        icon="group"
                        checked={notificationSettings.friendActivity}
                        onChange={(v) => setNotificationSettings({...notificationSettings, friendActivity: v})}
                      />

                      <SettingToggle
                        label="Challenge Invites"
                        description="Receive study challenge invitations"
                        icon="sports_esports"
                        checked={notificationSettings.challengeInvites}
                        onChange={(v) => setNotificationSettings({...notificationSettings, challengeInvites: v})}
                      />

                      <SettingToggle
                        label="Parent Updates"
                        description="Send progress updates to linked parents"
                        icon="family_restroom"
                        checked={notificationSettings.parentUpdates}
                        onChange={(v) => setNotificationSettings({...notificationSettings, parentUpdates: v})}
                      />

                      <SettingToggle
                        label="Weekly Email Digest"
                        description="Receive weekly progress summary via email"
                        icon="mail"
                        checked={notificationSettings.emailDigest}
                        onChange={(v) => setNotificationSettings({...notificationSettings, emailDigest: v})}
                      />

                      <div className="flex justify-end pt-4">
                        <PixelButton onClick={handleSaveNotifications} variant="primary">
                          SAVE PREFERENCES
                        </PixelButton>
                      </div>
                    </div>
                  </div>
                </PixelCard>
              )}

              {/* Privacy Section */}
              {activeSection === 'privacy' && (
                <PixelCard>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="material-symbols-outlined text-primary text-2xl">security</span>
                      <h2 className="font-['Press_Start_2P'] text-lg text-on-surface">PRIVACY</h2>
                    </div>

                    <div className="space-y-4">
                      <SettingToggle
                        label="Public Profile"
                        description="Allow others to view your profile and stats"
                        icon="public"
                        checked={privacySettings.publicProfile}
                        onChange={(v) => setPrivacySettings({...privacySettings, publicProfile: v})}
                      />

                      <SettingToggle
                        label="Show on Leaderboard"
                        description="Display your rank on public leaderboards"
                        icon="leaderboard"
                        checked={privacySettings.showOnLeaderboard}
                        onChange={(v) => setPrivacySettings({...privacySettings, showOnLeaderboard: v})}
                      />

                      <SettingToggle
                        label="Allow Friend Requests"
                        description="Let others send you friend requests"
                        icon="person_add"
                        checked={privacySettings.allowFriendRequests}
                        onChange={(v) => setPrivacySettings({...privacySettings, allowFriendRequests: v})}
                      />

                      <SettingToggle
                        label="Share Progress with Parents"
                        description="Allow linked parents to see your study data"
                        icon="visibility"
                        checked={privacySettings.shareProgressWithParents}
                        onChange={(v) => setPrivacySettings({...privacySettings, shareProgressWithParents: v})}
                      />

                      <SettingToggle
                        label="AI Learning Analysis"
                        description="Allow AI to analyze your patterns for better recommendations"
                        icon="psychology"
                        checked={privacySettings.allowAIAnalysis}
                        onChange={(v) => setPrivacySettings({...privacySettings, allowAIAnalysis: v})}
                      />

                      <div className="flex justify-end pt-4">
                        <PixelButton onClick={handleSavePrivacy} variant="primary">
                          SAVE PRIVACY SETTINGS
                        </PixelButton>
                      </div>
                    </div>
                  </div>
                </PixelCard>
              )}

              {/* Account Section */}
              {activeSection === 'account' && (
                <>
                  <PixelCard>
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-primary text-2xl">settings</span>
                        <h2 className="font-['Press_Start_2P'] text-lg text-on-surface">ACCOUNT</h2>
                      </div>

                      <div className="space-y-6">
                        {/* Change Password */}
                        <div className="p-4 bg-surface-container-low border border-outline-variant">
                          <h3 className="font-['Press_Start_2P'] text-[12px] text-on-surface mb-2">CHANGE PASSWORD</h3>
                          <p className="text-sm text-on-surface-variant mb-4">Update your password to keep your account secure</p>
                          <PixelButton variant="secondary" size="sm" onClick={() => navigate('/forgot-password')}>
                            CHANGE PASSWORD
                          </PixelButton>
                        </div>

                        {/* Linked Accounts */}
                        <div className="p-4 bg-surface-container-low border border-outline-variant">
                          <h3 className="font-['Press_Start_2P'] text-[12px] text-on-surface mb-2">LINKED ACCOUNTS</h3>
                          <p className="text-sm text-on-surface-variant mb-4">Manage connected parent/guardian accounts</p>
                          <PixelButton variant="secondary" size="sm" onClick={() => navigate('/guardians')}>
                            MANAGE GUARDIANS
                          </PixelButton>
                        </div>

                        {/* Data Export */}
                        <div className="p-4 bg-surface-container-low border border-outline-variant">
                          <h3 className="font-['Press_Start_2P'] text-[12px] text-on-surface mb-2">DATA EXPORT</h3>
                          <p className="text-sm text-on-surface-variant mb-4">Download all your data (GDPR compliance)</p>
                          <PixelButton variant="secondary" size="sm" onClick={() => alert('Data export feature coming soon!')}>
                            EXPORT DATA
                          </PixelButton>
                        </div>

                        {/* Logout */}
                        <div className="p-4 bg-error-container/30 border border-error">
                          <h3 className="font-['Press_Start_2P'] text-[12px] text-error mb-2">LOGOUT</h3>
                          <p className="text-sm text-on-surface-variant mb-4">Sign out from your account</p>
                          <PixelButton variant="ghost" onClick={handleLogout}>
                            LOGOUT
                          </PixelButton>
                        </div>
                      </div>
                    </div>
                  </PixelCard>

                  {/* Danger Zone */}
                  <PixelCard variant="dark">
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-6">
                        <span className="material-symbols-outlined text-error text-2xl">warning</span>
                        <h2 className="font-['Press_Start_2P'] text-lg text-error">DANGER ZONE</h2>
                      </div>

                      <div className="p-4 bg-error/10 border border-error">
                        <h3 className="font-['Press_Start_2P'] text-[12px] text-error mb-2">DELETE ACCOUNT</h3>
                        <p className="text-sm text-on-surface-variant mb-4">
                          Permanently delete your account and all associated data. This action cannot be undone!
                        </p>
                        <PixelButton variant="ghost" onClick={handleDeleteAccount}>
                          DELETE ACCOUNT
                        </PixelButton>
                      </div>
                    </div>
                  </PixelCard>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation (Mobile) */}
      <BottomNavBar 
        items={navItems.slice(0, 4)} 
        activeItem=""
        onItemClick={(id) => {
          const item = navItems.find(n => n.id === id);
          if (item) navigate(item.href);
        }}
      />
    </div>
  );
};

/**
 * Form Field Component
 */
const FormField = ({ label, value, onChange, placeholder, type = 'text', options = [] }) => {
  const baseClasses = "w-full bg-surface-container-lowest border-2 border-outline-variant p-3 text-on-surface focus:border-primary focus:outline-none transition-colors font-mono";

  return (
    <div>
      <label className="block font-['Press_Start_2P'] text-[10px] text-on-surface-variant mb-2">
        {label}
      </label>
      {type === 'select' ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClasses}
        >
          {options.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
          className={baseClasses + " resize-none"}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseClasses}
        />
      )}
    </div>
  );
};

/**
 * Setting Toggle Component
 */
const SettingToggle = ({ label, description, icon, checked, onChange, disabled = false }) => {
  return (
    <div className={cn(
      "flex items-start gap-4 p-4 border-2 transition-all",
      checked ? "bg-primary-container/20 border-primary/30" : "bg-surface-container-low border-outline-variant",
      disabled && "opacity-50"
    )}>
      <div className="w-10 h-10 bg-surface-container flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-on-surface-variant">{icon}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-['Press_Start_2P'] text-[10px] text-on-surface mb-1">{label}</h3>
        <p className="text-xs text-on-surface-variant">{description}</p>
      </div>

      <button
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={cn(
          "w-12 h-6 relative transition-colors",
          checked ? "bg-primary" : "bg-surface-container-high",
          disabled && "cursor-not-allowed"
        )}
      >
        <div className={cn(
          "absolute top-0.5 w-5 h-5 bg-on-primary transition-transform",
          checked ? "translate-x-6" : "translate-x-0.5"
        )} />
      </button>
    </div>
  );
};

export default Settings;
