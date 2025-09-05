"use client";

// Force dynamic rendering to avoid SSG issues with Stack Auth
export const dynamic = "force-dynamic";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { ArrowLeft, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import {
  FirstConfirmationModal,
  SecondConfirmationModal,
  SuccessModal,
} from "@/components/ConfirmationModals";
import { logError } from "@/lib/debug-logger";

interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  emailVerified: boolean;
}

export default function ProfilePage() {
  const user = useUser();
  const session = useMemo(
    () =>
      user
        ? {
            user: {
              email: user.primaryEmail,
              name: user.displayName,
              id: user.id,
            },
          }
        : null,
    [user],
  );
  const status =
    user === undefined ? "loading" : user ? "authenticated" : "unauthenticated";
  const router = useRouter();
  const t = useTranslations("profile");
  const locale = useLocale();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    dateOfBirth: "",
    ageRange: "",
    householdSize: 0,
    maritalStatus: "",
    dependents: 0,
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Data clearing state
  const [showFirstConfirmation, setShowFirstConfirmation] = useState(false);
  const [showSecondConfirmation, setShowSecondConfirmation] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [clearingData, setClearingData] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push(`/${locale}/login?callbackUrl=/${locale}/profile`);
    }
  }, [session, status, router, locale]);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch from API
      const response = await fetch("/api/profile");

      if (!response.ok) {
        throw new Error(t("errors.loadProfile"));
      }

      const data = await response.json();
      if (data.success) {
        setProfile(data.data);
        setProfileForm({
          firstName: data.data.firstName || "",
          lastName: data.data.lastName || "",
          email: data.data.email || "",
          phoneNumber: data.data.phoneNumber || "",
          addressLine1: data.data.addressLine1 || "",
          addressLine2: data.data.addressLine2 || "",
          city: data.data.city || "",
          state: data.data.state || "",
          postalCode: data.data.postalCode || "",
          country: data.data.country || "",
          dateOfBirth: data.data.dateOfBirth || "",
          ageRange: data.data.ageRange || "",
          householdSize: data.data.householdSize ?? 0,
          maritalStatus: data.data.maritalStatus || "",
          dependents: data.data.dependents ?? 0,
        });
      } else {
        throw new Error(data.error || t("errors.loadProfile"));
      }
    } catch (err) {
      logError("Profile", "Error loading profile", err);
      setError(t("errors.loadProfile"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Load profile data
  useEffect(() => {
    if (session) {
      loadProfile();
    }
  }, [session, loadProfile]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setSaving(true);

      // Send to API
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();
      if (data.success) {
        setProfile((prev) => (prev ? { ...prev, ...data.data } : null));
        setSuccess("Profile updated successfully");
      } else {
        throw new Error(data.error || "Failed to update profile");
      }
    } catch (err) {
      logError("Profile", "Error updating profile", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setSaving(true);

      // Send to API
      const response = await fetch("/api/profile/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordForm),
      });

      const data = await response.json();
      if (data.success) {
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
        setSuccess("Password changed successfully");
      } else {
        throw new Error(data.error || "Failed to change password");
      }
    } catch (err) {
      logError("Profile", "Error changing password", err);
      setError(
        err instanceof Error ? err.message : "Failed to change password",
      );
    } finally {
      setSaving(false);
    }
  };

  // Data clearing functions
  const handleClearDataClick = () => {
    setShowFirstConfirmation(true);
  };

  const handleFirstConfirmationProceed = () => {
    setShowFirstConfirmation(false);
    setShowSecondConfirmation(true);
  };

  const handleFirstConfirmationCancel = () => {
    setShowFirstConfirmation(false);
  };

  const handleSecondConfirmationProceed = async () => {
    setClearingData(true);
    try {
      // Clear user data via API
      const response = await fetch("/api/profile/clear-data", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setShowSecondConfirmation(false);
        setShowSuccessModal(true);
      } else {
        throw new Error("Failed to clear user data");
      }
    } catch (err) {
      logError("Profile", "Error clearing data", err);
      setError(
        err instanceof Error ? err.message : "Failed to clear user data",
      );
      setShowSecondConfirmation(false);
    } finally {
      setClearingData(false);
    }
  };

  const handleSecondConfirmationCancel = () => {
    setShowSecondConfirmation(false);
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Optionally refresh the page or redirect
    window.location.reload();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {t("errors.loadProfile")}
          </p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <Link
            href="/${locale}/dashboard"
            className="inline-flex items-center text-primary hover:underline font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            {t("backToDashboard")}
          </Link>
        </div>

        {/* Alerts */}
        {error && (
          <div className="safe-alert-danger px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="safe-alert-success px-4 py-3 rounded mb-6">
            {success}
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Information */}
          <div className="bg-card text-card-foreground rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">
                Profile Information
              </h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={profileForm.firstName}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          firstName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={profileForm.lastName}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          lastName: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-1"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={profileForm.email}
                    onChange={(e) =>
                      setProfileForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    required
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="addressLine1"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        {t("addressLine1")}
                      </label>
                      <input
                        id="addressLine1"
                        type="text"
                        value={profileForm.addressLine1}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            addressLine1: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="addressLine2"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        {t("addressLine2")}
                      </label>
                      <input
                        id="addressLine2"
                        type="text"
                        value={profileForm.addressLine2}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            addressLine2: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        {t("city")}
                      </label>
                      <input
                        id="city"
                        type="text"
                        value={profileForm.city}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            city: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="state"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        {t("state")}
                      </label>
                      <input
                        id="state"
                        type="text"
                        value={profileForm.state}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            state: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="postalCode"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        {t("postalCode")}
                      </label>
                      <input
                        id="postalCode"
                        type="text"
                        value={profileForm.postalCode}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            postalCode: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        {t("country")}
                      </label>
                      <input
                        id="country"
                        type="text"
                        value={profileForm.country}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            country: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="dateOfBirth"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        {t("dateOfBirth")}
                      </label>
                      <input
                        id="dateOfBirth"
                        type="date"
                        value={profileForm.dateOfBirth}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            dateOfBirth: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="ageRange"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        {t("ageRange")}
                      </label>
                      <input
                        id="ageRange"
                        type="text"
                        value={profileForm.ageRange}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            ageRange: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="householdSize"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        {t("householdSize")}
                      </label>
                      <input
                        id="householdSize"
                        type="number"
                        min={0}
                        value={profileForm.householdSize}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            householdSize: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="maritalStatus"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        {t("maritalStatus")}
                      </label>
                      <input
                        id="maritalStatus"
                        type="text"
                        value={profileForm.maritalStatus}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            maritalStatus: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="dependents"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        {t("dependents")}
                      </label>
                      <input
                        id="dependents"
                        type="number"
                        min={0}
                        value={profileForm.dependents}
                        onChange={(e) =>
                          setProfileForm((p) => ({
                            ...p,
                            dependents: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="phoneNumber"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      {t("phone")}
                    </label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      value={profileForm.phoneNumber}
                      onChange={(e) =>
                        setProfileForm((prev) => ({
                          ...prev,
                          phoneNumber: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary hover:opacity-90 text-primary-foreground px-6 py-2 rounded-md font-medium transition duration-200 disabled:opacity-50"
                  >
                    {saving ? t("saving") : t("saveChanges")}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Account Security */}
          <div className="bg-card text-card-foreground rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xl font-semibold text-gray-900">
                Account Security
              </h2>
            </div>
            <div className="p-6">
              {!showPasswordForm ? (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      Password
                    </h3>
                    <p className="text-muted-foreground">
                      Change your account password
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="safe-neutral-light hover:opacity-90 px-4 py-2 rounded-md font-medium transition duration-200"
                  >
                    Change Password
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Current Password *
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          currentPassword: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      New Password *
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          newPassword: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Must be at least 8 characters with uppercase, lowercase,
                      and number
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-foreground mb-1"
                    >
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm((prev) => ({
                          ...prev,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordForm({
                          currentPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                      }}
                      className="safe-neutral-light hover:opacity-90 px-4 py-2 rounded-md font-medium transition duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-primary hover:opacity-90 text-primary-foreground px-6 py-2 rounded-md font-medium transition duration-200 disabled:opacity-50"
                    >
                      {saving ? t("password.changing") : t("changePassword")}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Account Information */}
          {profile && (
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  Account Information
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-foreground">
                      Account Created
                    </h3>
                    <p className="text-gray-900">
                      {formatDate(profile.createdAt)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-foreground">
                      Last Updated
                    </h3>
                    <p className="text-gray-900">
                      {formatDate(profile.updatedAt)}
                    </p>
                  </div>
                  {profile.lastLogin && (
                    <div>
                      <h3 className="text-sm font-medium text-foreground">
                        {t("lastLogin")}
                      </h3>
                      <p className="text-gray-900">
                        {formatDate(profile.lastLogin)}
                      </p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700">
                      Email Verified
                    </h3>
                    <p
                      className={`font-medium ${profile.emailVerified ? "text-primary" : "text-destructive"}`}
                    >
                      {profile.emailVerified ? (
                        <>
                          <CheckCircle2
                            className="inline w-4 h-4 mr-1 text-green-600"
                            aria-hidden="true"
                          />{" "}
                          {t("verified")}
                        </>
                      ) : (
                        <>
                          <XCircle
                            className="inline w-4 h-4 mr-1 text-red-600"
                            aria-hidden="true"
                          />{" "}
                          {t("notVerified")}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Management Section */}
          <div className="bg-card text-card-foreground rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-xl font-semibold text-foreground">
                {t("dataManagement.title")}
              </h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <Trash2 className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-yellow-800">
                        {t("dataManagement.clearAllUserData")}
                      </h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        {t("dataManagement.permanentlyDeleteDescription")}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={handleClearDataClick}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t("dataManagement.clearAllData")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <FirstConfirmationModal
        isOpen={showFirstConfirmation}
        onClose={handleFirstConfirmationCancel}
        onConfirm={handleFirstConfirmationProceed}
        title={t("dataManagement.clearDataConfirmTitle")}
        message={t("dataManagement.clearDataConfirmMessage")}
        confirmText={t("dataManagement.yesContinue")}
        cancelText={t("cancel")}
      />

      <SecondConfirmationModal
        isOpen={showSecondConfirmation}
        onClose={handleSecondConfirmationCancel}
        onConfirm={handleSecondConfirmationProceed}
        title={t("dataManagement.finalConfirmation")}
        message={t("dataManagement.finalConfirmationMessage")}
        confirmationText={t("dataManagement.deleteAllDataConfirmation")}
        placeholder={t("dataManagement.typeDeleteAllDataPlaceholder")}
        confirmText={t("dataManagement.confirmDeletion")}
        cancelText={t("cancel")}
        loading={clearingData}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title={t("dataManagement.dataClearedSuccessfully")}
        message={t("dataManagement.dataClearedSuccessMessage")}
        closeText={t("dataManagement.continue")}
        showRegenerateOption={false}
      />
    </div>
  );
}
