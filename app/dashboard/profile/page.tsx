"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/app/providers/ThemeProvider";
import useRequireAuth from "@/app/hooks/useRequireAuth";
import useProfile from "@/app/hooks/useProfile";
import DashboardTopBar from "@/app/components/layout/DashboardTopBar";
import DashboardSidebar from "@/app/components/layout/DashboardSidebar";
import { API_CONFIG } from "@/app/config/constants";

export default function DashboardProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { token, initialized, auth } = useRequireAuth();
  const { profileName, profileEmail } = useProfile(token);

  const BACKEND_URL = API_CONFIG.BACKEND_URL;

  // Stany dla komunikacji z użytkownikiem (Feedback)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Stany dla nazwy użytkownika
  const [username, setUsername] = useState("");
  const [placeholderUsername, setPlaceholderUsername] = useState("");
const [placeholderEmail, setPlaceholderEmail] = useState("");
  const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);

  // Stany dla adresu e-mail
  const [email, setEmail] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);

  // Stany dla zmiany hasła
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Inicjalizacja formularza aktualną nazwą użytkownika, gdy hook ją zwróci
  useEffect(() => {
    if (profileName) {
      setPlaceholderUsername(profileName);
    }
    if (profileEmail) {
      setPlaceholderEmail(profileEmail);
    }
  }, [profileName, profileEmail]);

  if (!initialized) return null;
  if (!token) return null;

  // Wspólna funkcja do czyszczenia komunikatów po kilku sekundach
  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  // 1. Aktualizacja FullName
  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    setIsUpdatingUsername(true);
    setFeedback(null);

    if(username.length < 6) {
      showFeedback("error", "Username must be at least 6 characters long");
      setIsUpdatingUsername(false);
      return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/utils/profile/name`, {
        method: "PATCH", // lub POST, zależnie od tego jak masz skonfigurowany router w Go
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // Zakładam standardową autoryzację Bearer
        },
        body: JSON.stringify({
          full_name: username,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update username");
      }

      showFeedback("success", "Username updated successfully! Refresh to see changes.");
    } catch (err: any) {
      showFeedback("error", err.message);
    } finally {
      setIsUpdatingUsername(false);
    }
  };

  // 2. Aktualizacja Email
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsUpdatingEmail(true);
    setFeedback(null);

    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFeedback("error", "Please enter a valid email address");
        setIsUpdatingEmail(false);
        return;
    }

    try {
      const res = await fetch(`${BACKEND_URL}/api/utils/profile/email`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update email");
      }

      showFeedback("success", "Email updated successfully!");
      setEmail(""); // Czyszczenie inputa po sukcesie
    } catch (err: any) {
      showFeedback("error", err.message);
    } finally {
      setIsUpdatingEmail(false);
    }
  };

  // 3. Aktualizacja Hasła
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || newPassword !== confirmPassword) return;
    
    if (newPassword.length < 8) {
      showFeedback("error", "New password must be at least 8 characters long");
      return;
    }

    setIsUpdatingPassword(true);
    setFeedback(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/utils/profile/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update password");
      }

      showFeedback("success", "Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      showFeedback("error", err.message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="h-screen xl:flex bg-zinc-200 dark:bg-zinc-950 transition-colors select-none">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        profileName={profileName}
        onLogout={() => auth.logout()}
        activePage="profile"
      />

      <div className="flex-1 flex flex-col min-h-screen xl:ml-0">
        <DashboardTopBar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          theme={theme}
          onToggleTheme={toggleTheme}
          showSearch
          showNotifications
          showMessages
        />

        <main className="flex-1 overflow-y-auto bg-zinc-100 dark:bg-zinc-950 scrollbar-theme">
          <div className="p-3 sm:p-6 mx-auto">
            
            <div className="animate-in fade-in duration-300">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Profile Settings</h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">Manage your personal information and account security</p>
              </div>

              {/* Globalny komponent powiadomień */}
              {feedback && (
                <div className={`mb-6 p-4 rounded-xl border text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
                  feedback.type === "success" 
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" 
                    : "bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
                }`}>
                  <div className="flex items-center gap-2">
                    {feedback.type === "success" ? <i className="ri-checkbox-circle-line text-lg" /> : <i className="ri-error-warning-line text-lg" />}
                    <span>{feedback.message}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-6">
                
                {/* WRAPPER GRID DLA NAZWY UŻYTKOWNIKA I E-MAILA */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* 1. ZMIANA NAZWY UŻYTKOWNIKA */}
                  <form onSubmit={handleUpdateUsername} className="bg-white/85 dark:bg-zinc-900/20 backdrop-blur-xl rounded-2xl border border-zinc-300 dark:border-zinc-500/30 p-6 shadow-sm flex flex-col h-full">
                    <div className="pb-4 mb-5 border-b border-zinc-200 dark:border-zinc-700/50">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Change Username</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Update your public display name.</p>
                    </div>
                    
                    <div className="flex flex-col xl:flex-row gap-4 items-end mt-auto">
                      <div className="flex-1 w-full">
                        <label className="block text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider mb-2">New Username</label>
                        <div className="relative">
                          <i className="ri-user-line absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"></i>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder={placeholderUsername}
                            className="w-full h-12 pl-11 pr-4 bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-700/60 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                            disabled={isUpdatingUsername}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={isUpdatingUsername || !username || username.length < 6}
                        className="h-12 px-6 w-full xl:w-auto rounded-xl border border-cyan-500/50 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/15 hover:border-cyan-500/60 transition-all whitespace-nowrap cursor-pointer font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                      >
                        {isUpdatingUsername ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-save-line" />}
                        <span>Update Username</span>
                      </button>
                    </div>
                  </form>

                  {/* 2. ZMIANA ADRESU E-MAIL */}
                  <form onSubmit={handleUpdateEmail} className="bg-white/85 dark:bg-zinc-900/20 backdrop-blur-xl rounded-2xl border border-zinc-300 dark:border-zinc-500/30 p-6 shadow-sm flex flex-col h-full">
                    <div className="pb-4 mb-5 border-b border-zinc-200 dark:border-zinc-700/50">
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Email Address</h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Change the email associated with your account.</p>
                    </div>
                    
                    <div className="flex flex-col xl:flex-row gap-4 items-end mt-auto">
                      <div className="flex-1 w-full">
                        <label className="block text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider mb-2">New Email</label>
                        <div className="relative">
                          <i className="ri-mail-line absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"></i>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={placeholderEmail}
                            className="w-full h-12 pl-11 pr-4 bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-700/60 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                            disabled={isUpdatingEmail}
                          />
                        </div>
                      </div>
                      <button
                        type="submit"
                        disabled={isUpdatingEmail || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
                        className="h-12 px-6 w-full xl:w-auto rounded-xl border border-cyan-500/50 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/15 hover:border-cyan-500/60 transition-all whitespace-nowrap cursor-pointer font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                      >
                        {isUpdatingEmail ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-save-line" />}
                        <span>Update Email</span>
                      </button>
                    </div>
                  </form>

                </div>

                {/* 3. ZMIANA HASŁA */}
                <form onSubmit={handleUpdatePassword} className="bg-white/85 dark:bg-zinc-900/20 backdrop-blur-xl rounded-2xl border border-zinc-300 dark:border-zinc-500/30 p-6 shadow-sm">
                  <div className="pb-4 mb-5 border-b border-zinc-200 dark:border-zinc-700/50">
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Change Password</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">Ensure your account is using a long, random password to stay secure.</p>
                  </div>
                  
                  <div className="flex flex-col gap-5">
                    {/* Stare hasło */}
                    <div className="w-full lg:w-1/2">
                      <label className="block text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider mb-2">Current Password</label>
                      <div className="relative">
                        <i className="ri-lock-line absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"></i>
                        <input
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="Enter current password"
                          className="w-full h-12 pl-11 pr-4 bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-700/60 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                          disabled={isUpdatingPassword}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Nowe hasło */}
                      <div>
                        <label className="block text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider mb-2">New Password</label>
                        <div className="relative">
                          <i className="ri-lock-password-line absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"></i>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full h-12 pl-11 pr-4 bg-zinc-50/80 dark:bg-zinc-900/50 border border-zinc-300 dark:border-zinc-700/60 rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                            disabled={isUpdatingPassword}
                          />
                        </div>
                      </div>

                      {/* Potwierdź nowe hasło */}
                      <div>
                        <label className="block text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider mb-2">Confirm New Password</label>
                        <div className="relative">
                          <i className="ri-lock-password-line absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"></i>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm new password"
                            className={`w-full h-12 pl-11 pr-4 bg-zinc-50/80 dark:bg-zinc-900/50 border rounded-xl text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all ${
                              confirmPassword && newPassword !== confirmPassword 
                                ? "border-rose-500/50 focus:border-rose-500/50 focus:ring-2 focus:ring-rose-500/20" 
                                : "border-zinc-300 dark:border-zinc-700/60 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                            }`}
                            disabled={isUpdatingPassword}
                          />
                        </div>
                        {confirmPassword && newPassword !== confirmPassword && (
                          <p className="text-xs text-rose-500 mt-2 ml-1">Passwords do not match</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={isUpdatingPassword || !oldPassword || !newPassword || newPassword !== confirmPassword}
                        className="h-12 px-6 w-full sm:w-auto rounded-xl border border-cyan-500/50 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/15 hover:border-cyan-500/60 transition-all whitespace-nowrap cursor-pointer font-semibold disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                      >
                        {isUpdatingPassword ? <i className="ri-loader-4-line animate-spin" /> : <i className="ri-shield-keyhole-line" />}
                        <span>Update Password</span>
                      </button>
                    </div>
                  </div>
                </form>

              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}