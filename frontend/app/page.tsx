"use client";

import React, { useState, useEffect } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Template {
  _id: string;
  name: string;
  occasion: string;
  description: string;
  previewImage: string;
  layout: {
    theme?: string;
    primaryColor?: string;
    secondaryColor?: string;
    textColor?: string;
    header?: { text?: string };
    slogan?: { text?: string };
  };
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Poster {
  _id: string;
  name: string;
  party: string;
  designation: string;
  occasion: string;
  headline: string;
  unionOrThana: string;
  district: string;
  photos: string[];
  generatedImageUrl: string;
  status: "draft" | "generated";
  template?: Template;
  createdAt: string;
}

export default function Home() {
  // Auth state
  const [token, setToken] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [authLoading, setAuthLoading] = useState(false);

  // Template state
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [templatesLoading, setTemplatesLoading] = useState<boolean>(true);

  // Candidate Details state
  const [formData, setFormData] = useState({
    name: "",
    party: "",
    designation: "",
    occasion: "",
    headline: "",
    unionOrThana: "",
    district: "",
  });

  // Photo files state
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<string[]>([]);

  // Generation state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStep, setSubmitStep] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [generatedPoster, setGeneratedPoster] = useState<Poster | null>(null);

  // User poster history
  const [userPosters, setUserPosters] = useState<Poster[]>([]);

  // Load token from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem("poster_app_jwt");
    const savedUser = localStorage.getItem("poster_app_user");
    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        try {
          setCurrentUser(JSON.parse(savedUser));
        } catch {
          // ignore parsing error
        }
      }
    }
  }, []);

  // Fetch templates on load
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Fetch user posters when token is available
  useEffect(() => {
    if (token) {
      fetchUserPosters(token);
    } else {
      setUserPosters([]);
    }
  }, [token]);

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/templates`);
      const data = await res.json();
      if (res.ok && data.templates) {
        setTemplates(data.templates);
        if (data.templates.length > 0 && !selectedTemplateId) {
          setSelectedTemplateId(data.templates[0]._id);
          if (!formData.occasion) {
            setFormData((prev) => ({
              ...prev,
              occasion: data.templates[0].occasion || "Election Campaign",
            }));
          }
        }
      } else {
        setErrorMessage(data.message || "Failed to load templates.");
      }
    } catch (err: any) {
      setErrorMessage("Could not connect to backend to fetch templates.");
    } finally {
      setTemplatesLoading(false);
    }
  };

  const fetchUserPosters = async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/posters`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      if (res.ok && data.posters) {
        setUserPosters(data.posters);
      }
    } catch {
      // ignore
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setErrorMessage("");

    try {
      const endpoint =
        authMode === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload =
        authMode === "register"
          ? {
              name: authForm.name,
              email: authForm.email,
              password: authForm.password,
            }
          : { email: authForm.email, password: authForm.password };

      const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      if (authMode === "register") {
        // Automatically login after registration
        const loginRes = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: authForm.email,
            password: authForm.password,
          }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok && loginData.token) {
          saveSession(loginData.token, loginData.user);
        } else {
          setAuthMode("login");
          setSuccessMessage("Registration successful! Please log in.");
        }
      } else {
        saveSession(data.token, data.user);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication error occurred.");
    } finally {
      setAuthLoading(false);
    }
  };

  const saveSession = (newToken: string, newUser: User) => {
    setToken(newToken);
    setCurrentUser(newUser);
    localStorage.setItem("poster_app_jwt", newToken);
    localStorage.setItem("poster_app_user", JSON.stringify(newUser));
    setSuccessMessage(`Logged in as ${newUser.email}`);
  };

  const handleLogout = () => {
    setToken("");
    setCurrentUser(null);
    localStorage.removeItem("poster_app_jwt");
    localStorage.removeItem("poster_app_user");
    setGeneratedPoster(null);
  };

  // Quick fill test data helper
  const handleQuickFill = () => {
    setFormData({
      name: "Rupali Rahman",
      party: "Democratic Coalition Party",
      designation: "General Secretary Candidate",
      occasion: "Election Campaign 2026",
      headline: "Building a Modern and Prosperous Nation Together",
      unionOrThana: "Dhanmondi",
      district: "Dhaka",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).slice(0, 3);
    setSelectedFiles(files);

    // Create previews
    const previews = files.map((file) => URL.createObjectURL(file));
    setFilePreviews(previews);
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    const updatedPreviews = filePreviews.filter((_, i) => i !== index);
    setFilePreviews(updatedPreviews);
  };

  const handleGeneratePoster = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!token) {
      setErrorMessage("Please login first to create and generate a poster.");
      return;
    }

    if (!selectedTemplateId) {
      setErrorMessage("Please select a poster template.");
      return;
    }

    if (
      !formData.name.trim() ||
      !formData.party.trim() ||
      !formData.designation.trim() ||
      !formData.occasion.trim() ||
      !formData.headline.trim() ||
      !formData.unionOrThana.trim() ||
      !formData.district.trim()
    ) {
      setErrorMessage("Please fill in all candidate and campaign details.");
      return;
    }

    setIsSubmitting(true);

    try {
      let uploadedPhotoUrls: string[] = [];

      // Step 1: Upload photos if any selected
      if (selectedFiles.length > 0) {
        setSubmitStep("Uploading candidate photos to Cloudinary...");
        const uploadFormData = new FormData();
        selectedFiles.forEach((file) => {
          uploadFormData.append("photos", file);
        });

        const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadFormData,
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          throw new Error(uploadData.message || "Failed to upload photo(s).");
        }
        uploadedPhotoUrls = uploadData.urls || [];
      }

      // Step 2: Create and render the poster
      setSubmitStep("Generating composite political poster with AI rendering...");
      const posterPayload = {
        template: selectedTemplateId,
        name: formData.name.trim(),
        party: formData.party.trim(),
        designation: formData.designation.trim(),
        unionOrThana: formData.unionOrThana.trim(),
        district: formData.district.trim(),
        occasion: formData.occasion.trim(),
        headline: formData.headline.trim(),
        photos: uploadedPhotoUrls,
      };

      const posterRes = await fetch(`${API_BASE_URL}/api/posters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(posterPayload),
      });

      const posterData = await posterRes.json();

      if (!posterRes.ok) {
        throw new Error(posterData.message || "Failed to create poster.");
      }

      setGeneratedPoster(posterData.poster);
      setSuccessMessage("Poster created and generated successfully!");
      fetchUserPosters(token);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
      setSubmitStep("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-rose-600 via-amber-500 to-emerald-500 flex items-center justify-center font-black text-xl text-white shadow-lg">
              P
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-none">
                AI Political Poster Maker
              </h1>
              <p className="text-xs text-slate-400">
                Automated High-Resolution Campaign Graphic Generator
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {currentUser ? (
              <div className="flex items-center space-x-3 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700">
                <span className="text-xs text-slate-300">
                  👤 {currentUser.name || currentUser.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <span className="text-xs text-amber-400 bg-amber-950/50 border border-amber-800/50 px-3 py-1 rounded-full">
                🔒 Sign in below to generate posters
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Global Notifications */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 flex items-start justify-between shadow-lg">
            <div className="flex items-center space-x-2">
              <span className="text-xl">⚠️</span>
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage("")}
              className="text-rose-400 hover:text-rose-200 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-200 flex items-start justify-between shadow-lg">
            <div className="flex items-center space-x-2">
              <span className="text-xl">✅</span>
              <p className="text-sm font-medium">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage("")}
              className="text-emerald-400 hover:text-emerald-200 font-bold ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Authentication Card (if not logged in) */}
        {!token && (
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-xl max-w-lg mx-auto">
            <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
              <h2 className="text-lg font-bold text-white">
                {authMode === "login" ? "Sign In to Continue" : "Create an Account"}
              </h2>
              <button
                type="button"
                onClick={() =>
                  setAuthMode(authMode === "login" ? "register" : "login")
                }
                className="text-xs text-cyan-400 hover:underline"
              >
                {authMode === "login"
                  ? "Need an account? Register"
                  : "Already registered? Login"}
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "register" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={authForm.name}
                    onChange={(e) =>
                      setAuthForm({ ...authForm, name: e.target.value })
                    }
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, email: e.target.value })
                  }
                  placeholder="user@example.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={authForm.password}
                  onChange={(e) =>
                    setAuthForm({ ...authForm, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 rounded-lg text-sm transition shadow-md disabled:opacity-50"
              >
                {authLoading
                  ? "Processing..."
                  : authMode === "login"
                  ? "Log In"
                  : "Register"}
              </button>
            </form>
          </div>
        )}

        {/* Poster Generator Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 space-y-8">
            <form onSubmit={handleGeneratePoster} className="space-y-6">
              {/* Step 1: Select Template */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-sm">
                      1
                    </span>
                    <h2 className="text-base font-bold text-white">
                      Choose Poster Template
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">
                    {templates.length} available
                  </span>
                </div>

                {templatesLoading ? (
                  <div className="py-8 text-center text-sm text-slate-400">
                    Loading templates...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {templates.map((tpl) => {
                      const isSelected = selectedTemplateId === tpl._id;
                      return (
                        <div
                          key={tpl._id}
                          onClick={() => setSelectedTemplateId(tpl._id)}
                          className={`cursor-pointer rounded-xl border-2 transition p-3 flex flex-col justify-between ${
                            isSelected
                              ? "border-cyan-400 bg-cyan-950/30 shadow-lg shadow-cyan-950/50"
                              : "border-slate-700 bg-slate-900/60 hover:border-slate-500"
                          }`}
                        >
                          <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden mb-3 bg-slate-950">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={tpl.previewImage}
                              alt={tpl.name}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute top-2 right-2 bg-cyan-500 text-slate-950 font-black rounded-full w-6 h-6 flex items-center justify-center text-xs shadow">
                                ✓
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 mb-1">
                              {tpl.occasion}
                            </span>
                            <h3 className="font-semibold text-xs text-white line-clamp-2">
                              {tpl.name}
                            </h3>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 2: Upload Candidate Photos */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-sm">
                      2
                    </span>
                    <h2 className="text-base font-bold text-white">
                      Upload Candidate Photos
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">1 to 3 images</span>
                </div>

                <div className="space-y-4">
                  <label className="border-2 border-dashed border-slate-600 hover:border-cyan-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-slate-900/40 transition">
                    <span className="text-3xl mb-2">📸</span>
                    <span className="text-sm font-semibold text-slate-200">
                      Click to browse or drag photos here
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      PNG, JPG, or WEBP up to 5MB each (Max 3)
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {filePreviews.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                      {filePreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden border border-slate-600 group bg-slate-950"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preview}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Candidate & Campaign Details */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-sm">
                      3
                    </span>
                    <h2 className="text-base font-bold text-white">
                      Candidate & Campaign Details
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickFill}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold"
                  >
                    ⚡ Auto-fill Sample Data
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Candidate Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. Rupali Rahman"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Party / Organization *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.party}
                      onChange={(e) =>
                        setFormData({ ...formData, party: e.target.value })
                      }
                      placeholder="e.g. Democratic Coalition Party"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Designation / Running For *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.designation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          designation: e.target.value,
                        })
                      }
                      placeholder="e.g. General Secretary Candidate"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Occasion / Event *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.occasion}
                      onChange={(e) =>
                        setFormData({ ...formData, occasion: e.target.value })
                      }
                      placeholder="e.g. Election Campaign 2026"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Main Headline / Slogan *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.headline}
                      onChange={(e) =>
                        setFormData({ ...formData, headline: e.target.value })
                      }
                      placeholder="e.g. Vote for Progress and Leadership"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Union / Thana / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.unionOrThana}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          unionOrThana: e.target.value,
                        })
                      }
                      placeholder="e.g. Dhanmondi"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      District / City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.district}
                      onChange={(e) =>
                        setFormData({ ...formData, district: e.target.value })
                      }
                      placeholder="e.g. Dhaka"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={isSubmitting || !token}
                className="w-full py-4 px-6 rounded-xl font-bold text-base bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-xl shadow-teal-950/50 transition transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-spin text-xl">⏳</span>
                    <span>{submitStep || "Generating AI Poster..."}</span>
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    <span>Generate AI Political Poster</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Generated Output & Live Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>🎨</span>
                  <span>Generated Poster Output</span>
                </h2>
                {generatedPoster && (
                  <span className="text-xs bg-emerald-950 border border-emerald-800 text-emerald-300 px-2.5 py-0.5 rounded-full font-semibold">
                    Status: {generatedPoster.status}
                  </span>
                )}
              </div>

              {isSubmitting ? (
                <div className="aspect-[3/4] w-full rounded-xl bg-slate-950 border border-slate-700 flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                  <div className="space-y-1">
                    <p className="font-bold text-white text-base">
                      Rendering Poster Graphic
                    </p>
                    <p className="text-xs text-slate-400">{submitStep}</p>
                  </div>
                </div>
              ) : generatedPoster && generatedPoster.generatedImageUrl ? (
                <div className="space-y-4">
                  <div className="aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-950 border-2 border-emerald-500/50 shadow-2xl relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={generatedPoster.generatedImageUrl}
                      alt={generatedPoster.headline}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="space-y-2">
                    <a
                      href={generatedPoster.generatedImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download="political_poster.jpg"
                      className="w-full block text-center py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-bold shadow transition"
                    >
                      ⬇️ View / Download High-Res Poster
                    </a>
                  </div>
                </div>
              ) : (
                <div className="aspect-[3/4] w-full rounded-xl bg-slate-950/60 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-3">
                  <span className="text-4xl">🖼️</span>
                  <p className="text-sm font-medium">
                    Your generated high-resolution poster will appear here after
                    submission.
                  </p>
                </div>
              )}
            </div>

            {/* Poster History */}
            {userPosters.length > 0 && (
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-sm text-white mb-3 flex items-center space-x-2">
                  <span>📜</span>
                  <span>Your Previous Posters ({userPosters.length})</span>
                </h3>
                <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                  {userPosters.map((p) => (
                    <div
                      key={p._id}
                      onClick={() => setGeneratedPoster(p)}
                      className="cursor-pointer border border-slate-700 rounded-lg p-2 bg-slate-900/60 hover:border-cyan-500 transition"
                    >
                      <div className="aspect-[3/4] rounded overflow-hidden bg-slate-950 mb-1.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.generatedImageUrl || p.photos[0] || "/placeholder.jpg"}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-xs font-semibold text-white truncate">
                        {p.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate">
                        {p.occasion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
