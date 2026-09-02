import React, { useState, useEffect, useRef } from 'react';
import {
  UserCheck,
  Shield,
  Bell,
  Lock,
  Phone,
  Mail,
  Building2,
  Save,
  CheckCircle2,
  KeyRound,
  FileSignature,
  Sliders,
  Palette,
  Sparkles,
  Camera,
  Upload,
  Image as ImageIcon,
  RefreshCw,
  Eye,
  EyeOff,
  AlertCircle,
  Key,
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { UserNotificationsConfig } from '../../types/crm';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
];

export const UserProfileSettings: React.FC = () => {
  const { currentUser, updateUserProfile, changeSelfPassword, companies } = useCRM();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Self Password Change State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({
    name: currentUser.name || '',
    title: currentUser.title || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '+971 50 123 4567',
    department: currentUser.department || 'Executive Management',
    avatar: currentUser.avatar || '',
    bio: currentUser.bio || 'Managing Partner & Chief Operating Officer at ADCS Master Enterprise.',
    signature: currentUser.signature || 'Digitally Authorized by ADCS Master Executive Board',
    securityPin: currentUser.securityPin || '9842',
    theme: currentUser.theme || 'dark',
    notificationsConfig: currentUser.notificationsConfig || {
      emailOnNewClient: true,
      emailOnPayment: true,
      smsOnVisaExpiry: true,
      urgentTaskAlerts: true,
    } as UserNotificationsConfig,
  });

  // Sync form state if currentUser changes
  useEffect(() => {
    setProfileForm({
      name: currentUser.name || '',
      title: currentUser.title || '',
      email: currentUser.email || '',
      phone: currentUser.phone || '+971 50 123 4567',
      department: currentUser.department || 'Executive Management',
      avatar: currentUser.avatar || '',
      bio: currentUser.bio || 'Managing Partner & Chief Operating Officer at ADCS Master Enterprise.',
      signature: currentUser.signature || 'Digitally Authorized by ADCS Master Executive Board',
      securityPin: currentUser.securityPin || '9842',
      theme: currentUser.theme || 'dark',
      notificationsConfig: currentUser.notificationsConfig || {
        emailOnNewClient: true,
        emailOnPayment: true,
        smsOnVisaExpiry: true,
        urgentTaskAlerts: true,
      } as UserNotificationsConfig,
    });
  }, [currentUser]);

  const assignedComp = companies.find((c) => c.id === currentUser.companyId);

  // Handle local file upload from device
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size exceeds 5MB. Please choose a smaller image.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileForm((prev) => ({
            ...prev,
            avatar: event.target?.result as string,
          }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(currentUser.id, {
      name: profileForm.name,
      title: profileForm.title,
      email: profileForm.email,
      phone: profileForm.phone,
      department: profileForm.department,
      avatar: profileForm.avatar,
      bio: profileForm.bio,
      signature: profileForm.signature,
      securityPin: profileForm.securityPin,
      theme: profileForm.theme,
      notificationsConfig: profileForm.notificationsConfig,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (!passwordForm.newPassword) {
      setPassError('Please enter a new password.');
      return;
    }
    if (passwordForm.newPassword.length < 4) {
      setPassError('New password must be at least 4 characters long.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPassError('New password and confirmation do not match.');
      return;
    }

    const result = changeSelfPassword(
      passwordForm.currentPassword,
      passwordForm.newPassword,
      profileForm.securityPin
    );

    if (result.success) {
      setPassSuccess(result.message);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setPassSuccess(null), 5000);
    } else {
      setPassError(result.message);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">User Account & Profile Settings</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
              {currentUser.role.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalize your identity, digital signature credentials, profile avatar, security PIN, and alert routing
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile Saved & Updated!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card & Avatar */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-500" />
            <span>Public Identity & Profile Image</span>
          </h2>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageFileChange}
            accept="image/*"
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <img
                src={profileForm.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                alt={profileForm.name}
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-md transition-all group-hover:brightness-75"
              />
              <div className="absolute inset-0 bg-slate-950/60 text-white rounded-2xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold">
                <Camera className="w-5 h-5 mb-1" />
                Upload Photo
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Image from Device</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newUrl = prompt('Enter new Avatar Image URL:', profileForm.avatar);
                    if (newUrl) setProfileForm({ ...profileForm, avatar: newUrl });
                  }}
                  className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>From URL</span>
                </button>
              </div>

              {/* Preset Avatars */}
              <div>
                <span className="text-[10px] font-semibold uppercase text-slate-400 block mb-1.5">Or Choose a Preset:</span>
                <div className="flex items-center gap-2">
                  {PRESET_AVATARS.map((url, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setProfileForm({ ...profileForm, avatar: url })}
                      className={`w-7 h-7 rounded-lg overflow-hidden border-2 transition-all ${
                        profileForm.avatar === url
                          ? 'border-blue-500 ring-2 ring-blue-500/30 scale-110'
                          : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-1">
                <Building2 className="w-3.5 h-3.5 text-blue-500" />
                <span>{assignedComp ? assignedComp.name : 'Master Enterprise Group (Global)'}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Full Legal Name *</label>
              <input
                type="text"
                required
                value={profileForm.name ?? ''}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Corporate Job Title</label>
              <input
                type="text"
                value={profileForm.title ?? ''}
                onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={profileForm.email ?? ''}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Direct Phone / WhatsApp</label>
              <input
                type="text"
                value={profileForm.phone ?? ''}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Department</label>
              <input
                type="text"
                value={profileForm.department ?? ''}
                onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Avatar Image URL / Data</label>
              <input
                type="text"
                value={profileForm.avatar.length > 50 ? `${profileForm.avatar.substring(0, 45)}... (Device Upload)` : profileForm.avatar}
                onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono text-slate-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Professional Bio</label>
            <textarea
              rows={2}
              value={profileForm.bio ?? ''}
              onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        {/* Security PIN & Digital Signature (Staff only) */}
        {currentUser.role !== 'client' && (
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-purple-500" />
              <span>Digital Authorization & Security PIN</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Security Authorization PIN (4-Digits)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={profileForm.securityPin ?? ''}
                  onChange={(e) => setProfileForm({ ...profileForm, securityPin: e.target.value })}
                  placeholder="****"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-mono text-center tracking-widest text-base"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Required when approving government fee vouchers and issuing clearance certificates.
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Official Digital Sign-off Representation
                </label>
                <input
                  type="text"
                  value={profileForm.signature ?? ''}
                  onChange={(e) => setProfileForm({ ...profileForm, signature: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 font-serif italic"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Printed on generated PDF invoices and work progress reports.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Change Account Password & Security Credentials */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-500" />
              <span>Change Account Password</span>
            </h2>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-medium">
              Self Password Update
            </span>
          </div>

          {passSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{passSuccess}</span>
            </div>
          )}

          {passError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-center gap-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{passError}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={passwordForm.currentPassword ?? ''}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlePasswordSubmit(e);
                      }
                    }}
                    placeholder="Enter current password"
                    className="w-full p-2.5 pr-9 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={passwordForm.newPassword ?? ''}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handlePasswordSubmit(e);
                      }
                    }}
                    placeholder="Minimum 4 characters"
                    className="w-full p-2.5 pr-9 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showNewPass ? 'text' : 'password'}
                  value={passwordForm.confirmPassword ?? ''}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handlePasswordSubmit(e);
                    }
                  }}
                  placeholder="Repeat new password"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-slate-500">
                After changing, your new password is immediately active for future sign-ins.
              </span>
              <button
                type="button"
                onClick={handlePasswordSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                Update Password
              </button>
            </div>
          </div>
        </div>

        {/* Notification Routing Settings */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-500" />
            <span>Notification & Alert Preferences</span>
          </h2>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                  New Client & Lead Inflow Notifications
                </span>
                <span className="text-[11px] text-slate-400">Receive alert when new prospect or case is assigned</span>
              </div>
              <input
                type="checkbox"
                checked={profileForm.notificationsConfig.emailOnNewClient}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    notificationsConfig: {
                      ...profileForm.notificationsConfig,
                      emailOnNewClient: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                  Payment & Invoice Received Alerts
                </span>
                <span className="text-[11px] text-slate-400">Instant notification when client completes retainer or fee</span>
              </div>
              <input
                type="checkbox"
                checked={profileForm.notificationsConfig.emailOnPayment}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    notificationsConfig: {
                      ...profileForm.notificationsConfig,
                      emailOnPayment: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                  Document Expiry Radar Alerts (Passports, Visas, Trade Licenses)
                </span>
                <span className="text-[11px] text-slate-400">Notify 30/60/90 days before legal documents lapse</span>
              </div>
              <input
                type="checkbox"
                checked={profileForm.notificationsConfig.smsOnVisaExpiry}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    notificationsConfig: {
                      ...profileForm.notificationsConfig,
                      smsOnVisaExpiry: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 cursor-pointer">
              <div>
                <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                  Urgent Task & Deadline Alerts
                </span>
                <span className="text-[11px] text-slate-400">High-priority government follow-up alerts</span>
              </div>
              <input
                type="checkbox"
                checked={profileForm.notificationsConfig.urgentTaskAlerts}
                onChange={(e) =>
                  setProfileForm({
                    ...profileForm,
                    notificationsConfig: {
                      ...profileForm.notificationsConfig,
                      urgentTaskAlerts: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
            </label>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
