"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import { User, Globe, Mic, Shield, Save, Lock, Mail, Phone, MapPin, Link as LinkIcon } from "lucide-react";

type SettingsTab = "profile" | "language" | "voice" | "security";

export default function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.profile?.bio || "",
    phone: user?.profile?.phone || "",
    location: user?.profile?.location || "",
    website: user?.profile?.website || "",
    linkedin: user?.profile?.linkedin || "",
    github: user?.profile?.github || ""
  });

  const [languageData, setLanguageData] = useState({
    preferredLanguage: user?.profile?.preferredLanguage || "en",
    timezone: user?.profile?.timezone || "UTC"
  });

  const [voiceData, setVoiceData] = useState({
    voiceStyle: user?.profile?.voiceStyle || "professional",
    speechRate: user?.profile?.speechRate || "normal",
    pitch: user?.profile?.pitch || "normal"
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage("Profile updated successfully!");
    } catch (error) {
      setMessage("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleLanguageSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage("Language preferences updated successfully!");
    } catch (error) {
      setMessage("Failed to update language preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVoiceSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage("Voice settings updated successfully!");
    } catch (error) {
      setMessage("Failed to update voice settings. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSecuritySave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    if (securityData.newPassword !== securityData.confirmPassword) {
      setMessage("Passwords do not match!");
      setLoading(false);
      return;
    }
    
    if (securityData.newPassword.length < 6) {
      setMessage("Password must be at least 6 characters!");
      setLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage("Password updated successfully!");
      setSecurityData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setMessage("Failed to update password. Please check your current password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-text">Settings</h1>
          <p className="mt-2 text-muted-foreground">Manage your profile, preferences, and security settings</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-border pb-4">
          <Button
            variant={activeTab === "profile" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("profile")}
            className="gap-2"
          >
            <User size={16} /> Profile
          </Button>
          <Button
            variant={activeTab === "language" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("language")}
            className="gap-2"
          >
            <Globe size={16} /> Language
          </Button>
          <Button
            variant={activeTab === "voice" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("voice")}
            className="gap-2"
          >
            <Mic size={16} /> Voice
          </Button>
          <Button
            variant={activeTab === "security" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("security")}
            className="gap-2"
          >
            <Shield size={16} /> Security
          </Button>
        </div>

        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes("success") ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
            {message}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User size={20} /> Profile Information
              </CardTitle>
              <CardDescription>Update your personal information and public profile</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSave} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail size={14} /> Email
                    </label>
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      placeholder="john@example.com"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio</label>
                  <textarea
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 min-h-[100px]"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Phone size={14} /> Phone
                    </label>
                    <Input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="+1 234 567 8900"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <MapPin size={14} /> Location
                    </label>
                    <Input
                      value={profileData.location}
                      onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                      placeholder="San Francisco, CA"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Social Links</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <LinkIcon size={16} className="text-muted-foreground" />
                      <Input
                        value={profileData.website}
                        onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                    placeholder="https://yourwebsite.com"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-blue-600">LinkedIn:</span>
                      <Input
                        value={profileData.linkedin}
                        onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">GitHub:</span>
                      <Input
                        value={profileData.github}
                        onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                        placeholder="https://github.com/yourusername"
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" disabled={loading} className="gap-2">
                  <Save size={16} /> {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Language Tab */}
        {activeTab === "language" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe size={20} /> Language & Region
              </CardTitle>
              <CardDescription>Set your language preferences and timezone</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLanguageSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preferred Language</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={languageData.preferredLanguage}
                    onChange={(e) => setLanguageData({ ...languageData, preferredLanguage: e.target.value })}
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Timezone</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={languageData.timezone}
                    onChange={(e) => setLanguageData({ ...languageData, timezone: e.target.value })}
                  >
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT)</option>
                    <option value="Europe/Paris">Central European Time</option>
                    <option value="Asia/Tokyo">Japan Standard Time</option>
                    <option value="Asia/Shanghai">China Standard Time</option>
                    <option value="Asia/Kolkata">India Standard Time</option>
                  </select>
                </div>

                <Button type="submit" disabled={loading} className="gap-2">
                  <Save size={16} /> {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Voice Tab */}
        {activeTab === "voice" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic size={20} /> Voice Settings
              </CardTitle>
              <CardDescription>Customize voice feedback and speech preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVoiceSave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Voice Style</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={voiceData.voiceStyle}
                    onChange={(e) => setVoiceData({ ...voiceData, voiceStyle: e.target.value })}
                  >
                    <option value="professional">Professional</option>
                    <option value="friendly">Friendly</option>
                    <option value="formal">Formal</option>
                    <option value="casual">Casual</option>
                    <option value="encouraging">Encouraging</option>
                  </select>
                  <p className="text-xs text-muted-foreground">Choose the tone of voice feedback during interviews</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Speech Rate</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={voiceData.speechRate}
                    onChange={(e) => setVoiceData({ ...voiceData, speechRate: e.target.value })}
                  >
                    <option value="slow">Slow</option>
                    <option value="normal">Normal</option>
                    <option value="fast">Fast</option>
                  </select>
                  <p className="text-xs text-muted-foreground">Adjust the speed of voice feedback</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Pitch</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={voiceData.pitch}
                    onChange={(e) => setVoiceData({ ...voiceData, pitch: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                  <p className="text-xs text-muted-foreground">Adjust the pitch of voice feedback</p>
                </div>

                <Button type="submit" disabled={loading} className="gap-2">
                  <Save size={16} /> {loading ? "Saving..." : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield size={20} /> Security Settings
              </CardTitle>
              <CardDescription>Manage your password and account security</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSecuritySave} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Lock size={14} /> Current Password
                  </label>
                  <Input
                    type="password"
                    value={securityData.currentPassword}
                    onChange={(e) => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    value={securityData.newPassword}
                    onChange={(e) => setSecurityData({ ...securityData, newPassword: e.target.value })}
                    placeholder="Enter new password (min 6 characters)"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input
                    type="password"
                    value={securityData.confirmPassword}
                    onChange={(e) => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 dark:bg-yellow-900/20 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-300">
                    <strong>Security Tip:</strong> Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.
                  </p>
                </div>

                <Button type="submit" disabled={loading} className="gap-2">
                  <Save size={16} /> {loading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
