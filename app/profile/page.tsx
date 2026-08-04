"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, User, Lock, Mail, Camera, Check, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    async function loadUserProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFullName(user.user_metadata?.full_name || "");
        setEmail(user.email || "");
        setAvatarUrl(user.user_metadata?.avatar_url || null);
      }
      setLoading(false);
    }
    loadUserProfile();
  }, [supabase]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      setErrorMessage("");
      const file = e.target.files?.[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload image to Supabase Storage bucket named 'avatars'
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      // Update user metadata with avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) throw updateError;

      setAvatarUrl(publicUrl);
      setSuccessMessage("Avatar updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setErrorMessage(err.message || "Error uploading avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const updates: { email?: string; password?: string; data?: { full_name: string } } = {
        data: { full_name: fullName },
      };

      if (email) updates.email = email;
      if (newPassword) updates.password = newPassword;

      const { error } = await supabase.auth.updateUser(updates);

      if (error) throw error;

      setSuccessMessage("Profile updated successfully! Check your email if you changed your address for verification.");
      setNewPassword("");
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const userInitial = fullName ? fullName.charAt(0).toUpperCase() : "U";

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 p-4 pb-28 sm:px-6 transition-colors duration-200">
      <div className="w-full max-w-lg mx-auto flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 px-1">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">User Profile</h1>
        </div>

        {/* Feedback Alerts */}
        {successMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 px-4 py-3 rounded-2xl text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-2xl text-xs">
            {errorMessage}
          </div>
        )}

        {/* Avatar Upload Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center gap-4">
          <div className="relative group">
            <div className="w-20 h-20 rounded-full bg-blue-600 text-white font-bold text-2xl flex items-center justify-center overflow-hidden shadow-md">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                userInitial
              )}
            </div>
            <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
              {uploadingAvatar ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
              <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
            </label>
          </div>
          <div className="text-center">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">{fullName || "User"}</h2>
            <p className="text-xs text-slate-400">Click avatar image to change profile photo</p>
          </div>
        </div>

        {/* Form Details (Name, Email, Password) */}
        <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          
          {/* Change Name */}
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" /> Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Enter your full name"
            />
          </div>

          {/* Verify / Change Email */}
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" /> Email Address (Requires Verification)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Enter email address"
            />
          </div>

          {/* Change Password */}
          <div>
            <label className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-600" /> New Password (Optional)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="Leave blank to keep current password"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Save Changes</span>
          </button>

        </form>

      </div>
    </div>
  );
}