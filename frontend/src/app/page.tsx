"use client";

import React, { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import {
  HeartHandshake,
  Sparkles,
  ArrowRight,
  User,
  GraduationCap,
  Sprout,
  Smartphone,
  Clock,
  Moon,
  Activity,
  Brain,
  Flame,
  RotateCcw,
  BookOpen,
  Heart,
  Info,
  ShieldAlert,
  BatteryCharging,
  Wifi,
  Trees,
  Smile,
  Tv,
  Sliders
} from "lucide-react";

interface PredictionResult {
  prediction: string;
  confidence: number;
  probabilities: { [key: string]: number };
}

export default function Home() {
  // Navigation state: "welcome" | "assessment" | "loading" | "result"
  const [step, setStep] = useState<"welcome" | "assessment" | "loading" | "result">("welcome");
  
  // User name state (blank by default)
  const [userName, setUserName] = useState("");

  // Form states matching original dataset features
  const [formData, setFormData] = useState({
    Age: 21,
    Gender: "Female",
    Academic_Level: "Undergraduate",
    Country: "Egypt",
    Most_Used_Platform: "Instagram",
    Purpose_Of_Use: "Education",
    Avg_Daily_Usage_Hours: 6.0,
    Daily_Unlocks: 85,
    Study_Hours: 4.0,
    Physical_Activity_Hours: 1.0,
    Sleep_Hours_Per_Night: 6.5,
    Stress_Level: "Moderate"
  });

  // API States
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Analyzing your scrolling habits...");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dynamic dropdown metadata from backend
  const [countries, setCountries] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [purposes, setPurposes] = useState<string[]>([]);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Messages rotating during loading state
  const loadingMessages = [
    "Analyzing your scrolling habits...",
    "Teaching AI psychology...",
    "Looking for your missing sleep...",
    "Negotiating with TikTok...",
    "Almost done...",
    "Preparing your diagnosis..."
  ];

  // Rotate loading messages every second during loading step
  useEffect(() => {
    if (step !== "loading") return;

    let idx = 0;
    setLoadingMessage(loadingMessages[0]);

    const interval = setInterval(() => {
      idx++;
      if (idx < loadingMessages.length) {
        setLoadingMessage(loadingMessages[idx]);
      } else {
        idx = 0;
        setLoadingMessage(loadingMessages[0]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  // Fetch dynamic metadata options on mount
  useEffect(() => {
    fetch("http://localhost:8000/metadata")
      .then((res) => {
        if (!res.ok) throw new Error("Metadata request failed");
        return res.json();
      })
      .then((data) => {
        if (data.countries) setCountries(data.countries);
        if (data.platforms) setPlatforms(data.platforms);
        if (data.purposes) setPurposes(data.purposes);
      })
      .catch((err) => {
        console.warn("Could not connect to FastAPI server. Using static fallbacks.", err);
        // Fallbacks strictly matching the dataset features and values
        setCountries(["Egypt", "UAE", "Jordan", "Australia", "USA", "UK", "Other"]);
        setPlatforms(["Facebook", "Instagram", "KakaoTalk", "LINE", "LinkedIn", "Snapchat", "TikTok", "Twitter", "VKontakte", "WeChat", "WhatsApp", "YouTube"]);
        setPurposes(["Education", "Entertainment", "Networking", "News"]);
      });
  }, []);

  // Form input change handlers
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    // Map element IDs to the state properties
    const stateKey = id === "academicLevel" ? "Academic_Level" 
                   : id === "stressLevel" ? "Stress_Level"
                   : id === "screenTime" ? "Avg_Daily_Usage_Hours"
                   : id === "socialMedia" ? "Daily_Unlocks"
                   : id === "physicalActivity" ? "Physical_Activity_Hours"
                   : id === "sleepHours" ? "Sleep_Hours_Per_Night"
                   : id === "studyHours" ? "Study_Hours"
                   : id === "gender" ? "Gender"
                   : id === "age" ? "Age"
                   : id === "country" ? "Country"
                   : id; // for platform and purpose

    setFormData((prev) => ({
      ...prev,
      [stateKey]: value
    }));
  };

  const handleSliderChange = (id: string, value: number) => {
    const stateKey = id === "screenTime" ? "Avg_Daily_Usage_Hours"
                   : id === "socialMedia" ? "Daily_Unlocks"
                   : id === "physicalActivity" ? "Physical_Activity_Hours"
                   : id === "sleepHours" ? "Sleep_Hours_Per_Night"
                   : id === "studyHours" ? "Study_Hours"
                   : id;

    setFormData((prev) => ({
      ...prev,
      [stateKey]: value
    }));
  };

  // Submit Handler
  const startAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStep("loading");
    setError(null);
    setResult(null);

    const payload = {
      Age: Number(formData.Age),
      Gender: formData.Gender,
      Academic_Level: formData.Academic_Level,
      Country: formData.Country,
      Most_Used_Platform: formData.Most_Used_Platform,
      Purpose_Of_Use: formData.Purpose_Of_Use,
      Avg_Daily_Usage_Hours: Number(formData.Avg_Daily_Usage_Hours),
      Daily_Unlocks: Number(formData.Daily_Unlocks),
      Study_Hours: Number(formData.Study_Hours),
      Physical_Activity_Hours: Number(formData.Physical_Activity_Hours),
      Sleep_Hours_Per_Night: Number(formData.Sleep_Hours_Per_Night),
      Stress_Level: formData.Stress_Level
    };

    const start_time = Date.now();
    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json();
        const errorMessage = typeof errData.detail === "object"
          ? JSON.stringify(errData.detail)
          : (errData.detail || "Server error occurred during prediction.");
        throw new Error(errorMessage);
      }

      const data: PredictionResult = await response.json();
      console.log("Raw prediction result from backend:", data.prediction);

      // Ensure loader runs for at least 1.8 seconds for nice transition
      const elapsed = Date.now() - start_time;
      if (elapsed < 1800) {
        await new Promise((resolve) => setTimeout(resolve, 1800 - elapsed));
      }

      setResult(data);
      setStep("result");

      // Trigger Confetti if Good
      const sanitizedPred = sanitizePrediction(data.prediction);
      if (sanitizedPred === "good") {
        confetti({
          particleCount: 45,
          spread: 50,
          origin: { y: 0.55 },
          colors: ["#4A7C59", "#7EA885", "#D98A6C", "#E2DACB"],
          disableForReducedMotion: true
        });
      }

    } catch (err: any) {
      console.error("Execution error in startAnalysis:", err);
      setError(err.message || "Failed to connect to the classification server.");
      setStep("assessment");
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to sanitize prediction inputs (strings/numbers/indexes)
  const sanitizePrediction = (pred: any): string => {
    console.log("sanitizePrediction raw value:", pred);
    if (pred === null || pred === undefined) {
      return "moderate";
    }
    const predStr = String(pred).trim().toLowerCase();
    if (predStr === "good" || predStr === "0" || pred === 0) {
      return "good";
    }
    if (predStr === "low" || predStr === "1" || pred === 1) {
      return "low";
    }
    if (predStr === "moderate" || predStr === "2" || pred === 2) {
      return "moderate";
    }
    if (predStr.includes("good")) return "good";
    if (predStr.includes("low")) return "low";
    if (predStr.includes("mod")) return "moderate";
    return "moderate";
  };

  // Get result card mapping details based on prediction
  const getResultDetails = (pred: any) => {
    const sanitized = sanitizePrediction(pred);
    switch (sanitized) {
      case "good":
        return {
          emoji: "😄",
          title: "Your Day: Good",
          subtitle: "Your routine is supporting you well.",
          colorClass: "bg-[#F3F8F4] border-[#D1E4D6] text-[#3E684A]",
          note: userName ? `${userName}, you are doing wonderful and your daily balance is shining brightly.` : "You are doing wonderful and your daily balance is shining brightly."
        };
      case "low":
        return {
          emoji: "😔",
          title: "Your Day: Needs Care",
          subtitle: "Small steps can make a difference.",
          colorClass: "bg-[#FAF4F1] border-[#EFE0D8] text-[#A85B3B]",
          note: userName ? `${userName}, it's okay. You don't need to change everything at once. Give yourself time and space to breathe.` : "It's okay. You don't need to change everything at once. Give yourself time and space to breathe."
        };
      default:
        return {
          emoji: "😊",
          title: "Your Day: Balanced",
          subtitle: "Your routine is supporting you well.",
          colorClass: "bg-[#FAF6F0] border-[#EFE3D3] text-[#8C5E38]",
          note: userName ? `${userName}, you are doing well, and small changes can make your days even better.` : "You are doing well, and small changes can make your days even better."
        };
    }
  };

  // Generate dynamic supportive recommendations
  const getDynamicSuggestions = () => {
    const suggestions: string[] = [];
    const sleep = formData.Sleep_Hours_Per_Night;
    const usage = formData.Avg_Daily_Usage_Hours;
    const unlocks = formData.Daily_Unlocks;
    const study = formData.Study_Hours;
    const activity = formData.Physical_Activity_Hours;

    if (usage > 5.5 || unlocks > 110) {
      suggestions.push("Turn off non-essential notifications during deep focus times.");
    }
    if (sleep < 6.5) {
      suggestions.push("Dim room lighting 30 minutes before sleep to help your mind wind down.");
    }
    if (study > 7.0) {
      suggestions.push("Switch tasks or stretch briefly every hour to maintain mental clarity.");
    }
    if (activity < 1.5) {
      suggestions.push("Incorporate a brisk neighborhood walk to clear your thoughts.");
    }

    if (suggestions.length < 2) {
      suggestions.push("Maintain regular pauses throughout the day to keep your focus fresh.");
      suggestions.push("Celebrate your daily efforts, no matter how small they feel.");
    }

    return suggestions.slice(0, 3);
  };

  // Generate Next Focus Habit
  const getFocusHabit = () => {
    const sleep = formData.Sleep_Hours_Per_Night;
    const usage = formData.Avg_Daily_Usage_Hours;
    const unlocks = formData.Daily_Unlocks;

    if (sleep < 6.5) {
      return "Try keeping a more consistent bedtime this week.";
    } else if (usage > 6.0 || unlocks > 110) {
      return "Create a dedicated phone-free hour before evening rest.";
    } else {
      return "Keep protecting the peaceful balance you've built.";
    }
  };

  // Get mapped stress progress details
  const getStressProgress = (level: string) => {
    switch (level) {
      case "Low": return { percent: 30, insight: "Low Pressure", color: "bg-[#A78BFA]", thumb: "bg-[#7C3AED]" };
      case "High": return { percent: 100, insight: "Elevated Tension", color: "bg-rose-400", thumb: "bg-rose-600" };
      default: return { percent: 65, insight: "Manageable Tension", color: "bg-amber-400", thumb: "bg-amber-600" };
    }
  };

  // Reset function
  const resetAssessment = () => {
    setResult(null);
    setFormData({
      Age: 21,
      Gender: "Female",
      Academic_Level: "Undergraduate",
      Country: "Egypt",
      Most_Used_Platform: "Instagram",
      Purpose_Of_Use: "Education",
      Avg_Daily_Usage_Hours: 6.0,
      Daily_Unlocks: 85,
      Study_Hours: 4.0,
      Physical_Activity_Hours: 1.0,
      Sleep_Hours_Per_Night: 6.5,
      Stress_Level: "Moderate"
    });
    setStep("assessment");
  };

  // Pre-calculate details dynamically to prevent crashes in hidden sections
  const currentPrediction = result ? result.prediction : "moderate";
  const details = getResultDetails(currentPrediction);
  const suggestions = getDynamicSuggestions();

  return (
    <div className="max-w-5xl mx-auto w-full flex-grow flex flex-col items-center">
      
      {/* ==================== HEADER BRAND ==================== */}
      <header className="w-full flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#4A7C59] flex items-center justify-center text-white font-bold text-sm shadow-sm">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <span className="font-bold text-base tracking-tight text-[#2D312E]">MindWell</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EFEADF] border border-[#E2DACB] text-xs font-semibold text-[#374151]">
          <Sparkles className="w-3.5 h-3.5 text-[#4A7C59]" />
          <span>Wellness Companion</span>
        </div>
      </header>

      {/* ==================== MULTI-PAGE FLOW CONTAINER ==================== */}
      <main className="w-full flex-grow flex flex-col items-center justify-center">

        {/* ==================== PAGE 1: WELCOME PAGE ==================== */}
        <section
          id="pageWelcome"
          className={`w-full max-w-4xl py-6 md:py-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center fade-in-slide text-left ${
            step === "welcome" ? "" : "hidden"
          }`}
        >
          <div className="flex flex-col items-center text-center md:items-start md:text-left space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#2D312E] leading-tight">
              Mental Health Predictor
            </h1>
            <p className="text-sm sm:text-base text-[#374151] font-medium max-w-lg leading-relaxed">
              A quick interactive wellness assessment based on your daily lifestyle habits and university routines.
            </p>

            {/* Name Input Box */}
            <div className="w-full max-w-sm bg-white p-4 rounded-2xl card-shadow border border-[#EFEADF] space-y-2 mt-2 text-left">
              <label className="block text-xs font-bold text-[#2D312E]">What should MindWell call you?</label>
              <input
                type="text"
                id="userNameInput"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="input-warm w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#2D312E]"
              />
            </div>

            {/* Start Assessment Button */}
            <button
              type="button"
              onClick={() => setStep("assessment")}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-xs sm:text-sm text-white bg-[#4A7C59] hover:bg-[#3E684A] active:scale-[0.99] transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <span>Start Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Hero Illustration */}
          <div className="w-full flex justify-center items-center">
            <svg width="360" height="220" viewBox="0 0 380 230" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto max-w-[360px]">
              {/* Floating Social Media Icons */}
              <g transform="translate(45, 25)" className="animate-float-icon">
                <circle cx="16" cy="16" r="16" fill="#F2F7F3" stroke="#D4E5D7" strokeWidth={1.5}/>
                <path d="M16 22C16 22 10.5 17.5 10.5 13.5C10.5 11.5 12 10 13.5 10C14.8 10 16 11 16 11C16 11 17.2 10 18.5 10C20 10 21.5 11.5 21.5 13.5C21.5 17.5 16 22 16 22Z" fill="#4A7C59"/>
              </g>
              <g transform="translate(310, 35)" className="animate-float-icon [animation-delay:0.5s]">
                <circle cx="16" cy="16" r="16" fill="#FAF6F0" stroke="#EFE3D3" strokeWidth={1.5}/>
                <path d="M11 13C11 11.3431 12.3431 10 14 10H18C19.6569 10 21 11.3431 21 13V17C21 18.6569 19.6569 20 18 20H15L12 22V20H14C12.3431 20 11 18.6569 11 17V13Z" fill="#D98A6C"/>
              </g>
              <g transform="translate(325, 115)" className="animate-float-icon [animation-delay:1s]">
                <circle cx="14" cy="14" r="14" fill="#F2F7F3" stroke="#D4E5D7" strokeWidth={1.5}/>
                <path d="M14 7L15.8 12.2L21 14L15.8 15.8L14 21L12.2 15.8L7 14L12.2 12.2L14 7Z" fill="#5B8A68"/>
              </g>

              {/* Room shelf */}
              <rect x="250" y="25" width="50" height="56" rx="6" fill="#EAE4D5" stroke="#D3CBBA" strokeWidth={2}/>
              <path d="M262 52C271 39 278 64 287 43" stroke="#4A7C59" strokeWidth={2.5} strokeLinecap="round"/>

              {/* Desk */}
              <rect x="35" y="175" width="310" height="12" rx="6" fill="#C9BFAC"/>
              <rect x="55" y="187" width="9" height="32" rx="3" fill="#B0A590"/>
              <rect x="316" y="187" width="9" height="32" rx="3" fill="#B0A590"/>

              {/* Desk Plant */}
              <path d="M50 175L56 148H76L82 175H50Z" fill="#D98A6C"/>
              <path d="M66 148C57 132 41 135 37 126C53 126 62 135 66 148Z" fill="#4A7C59"/>
              <path d="M66 148C75 130 91 133 94 125C78 125 70 135 66 148Z" fill="#5B8A68"/>

              {/* Coffee Mug */}
              <rect x="275" y="156" width="46" height="19" rx="4" fill="#5B8A68"/>
              <rect x="280" y="142" width="36" height="16" rx="3" fill="#D98A6C"/>

              {/* Laptop */}
              <rect x="160" y="132" width="76" height="43" rx="5" fill="#3D433F"/>
              <rect x="164" y="136" width="68" height="33" rx="2" fill="#FAF8F5"/>
              <path d="M144 175L154 171H236L246 175H144Z" fill="#9DA59C"/>

              {/* Character */}
              <rect x="95" y="85" width="45" height="90" rx="8" fill="#5B8A68" opacity="0.3"/>
              <path d="M104 125C104 112 116 108 130 108C144 108 156 112 156 125V175H104V125Z" fill="#4A7C59"/>
              <path d="M120 108C120 115 140 115 140 108" stroke="#FAF8F5" strokeWidth={3} strokeLinecap="round"/>
              <path d="M112 120L152 145" stroke="#4A7C59" strokeWidth={10} strokeLinecap="round"/>
              <circle cx="155" cy="147" r="5" fill="#F0C8A8"/>
              <circle cx="130" cy="85" r="18" fill="#F0C8A8"/>
              <path d="M112 82C112 68 123 62 133 65C142 68 147 76 146 88C140 82 126 81 112 82Z" fill="#3D2E24"/>
              <rect x="110" y="175" width="16" height="28" rx="5" fill="#3D433F"/>
              <rect x="134" y="175" width="16" height="28" rx="5" fill="#3D433F"/>
            </svg>
          </div>
        </section>

        {/* ==================== PAGE 2: ASSESSMENT PAGE ==================== */}
        <section
          id="pageAssessment"
          className={`w-full max-w-5xl fade-in-slide py-4 text-left ${
            step === "assessment" ? "" : "hidden"
          }`}
        >
          {/* Profile Header */}
          <div className="bg-white rounded-2xl p-3.5 sm:p-4 card-shadow border border-[#EFEADF] mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#F2F7F3] border border-[#D4E5D7] flex items-center justify-center text-[#4A7C59] overflow-hidden shrink-0 shadow-sm">
                <svg width="28" height="28" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="50" fill="#EBF3ED"/>
                  <circle cx="50" cy="38" r="18" fill="#F0C8A8"/>
                  <path d="M35 35C35 22 45 18 55 20C65 22 68 30 67 42C60 38 45 37 35 35Z" fill="#3D2E24"/>
                  <path d="M32 68C32 55 40 50 50 50C60 50 68 55 68 68V80H32V68Z" fill="#4A7C59"/>
                </svg>
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-[#2D312E]">Hi {userName || "there"} ❤️</h2>
                <p className="text-[11px] font-medium text-[#374151] mt-0.5">Let's understand your daily routine</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-[#525851] bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#E6E0D4]">
              <Sliders className="w-3.5 h-3.5 text-[#4A7C59]" />
              <span>Interactive Assessment</span>
            </div>
          </div>

          {/* API Connection Warning block */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-700 rounded-xl p-4 flex items-start gap-3 text-xs font-semibold mb-6">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Assessment Form */}
          <form id="wellnessForm" onSubmit={startAnalysis} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
              
              {/* Card 1: Personal Profile */}
              <div className="bg-white rounded-2xl p-5 card-shadow border border-[#EFEADF] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-1.5 rounded-lg bg-[#FAF8F5] text-[#4A7C59] border border-[#EFEADF]">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2D312E]">Personal Profile</h3>
                      <p className="text-[11px] font-medium text-[#525851]">Basic demographic context</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3 mt-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2D312E] mb-1">Age</label>
                      <input
                        type="number"
                        id="age"
                        min="12"
                        max="60"
                        value={formData.Age}
                        onChange={handleInputChange}
                        required
                        className="input-warm w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#2D312E]"
                        placeholder="e.g. 21"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#2D312E] mb-1">Gender</label>
                      <select
                        id="gender"
                        value={formData.Gender}
                        onChange={handleInputChange}
                        className="input-warm w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#2D312E]"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#2D312E] mb-1">Country</label>
                      <select
                        id="country"
                        value={formData.Country}
                        onChange={handleInputChange}
                        className="input-warm w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#2D312E]"
                      >
                        {countries.length > 0 ? (
                          countries.map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))
                        ) : (
                          <option value="Egypt">Egypt</option>
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Academic Workload */}
              <div className="bg-white rounded-2xl p-5 card-shadow border border-[#EFEADF] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-1.5 rounded-lg bg-[#FAF8F5] text-[#4A7C59] border border-[#EFEADF]">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2D312E]">Academic Workload</h3>
                      <p className="text-[11px] font-medium text-[#525851]">Study & focus commitment</p>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div>
                      <label className="block text-xs font-bold text-[#2D312E] mb-1">Academic Level</label>
                      <select
                        id="academicLevel"
                        value={formData.Academic_Level}
                        onChange={handleInputChange}
                        className="input-warm w-full px-3 py-2 rounded-xl text-xs font-semibold text-[#2D312E]"
                      >
                        <option value="High School">High School</option>
                        <option value="Undergraduate">Undergraduate</option>
                        <option value="Graduate">Graduate</option>
                      </select>
                    </div>

                    <div className="bg-[#FAF8F5] p-3.5 rounded-xl border border-[#EFEADF] space-y-2.5">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D312E]">
                          <BookOpen className="w-3.5 h-3.5 text-[#4A7C59]" />
                          <span>Study Hours / Day</span>
                        </div>
                        <span className="text-xs font-bold text-[#4A7C59] bg-[#EAE4D5] px-2 py-0.5 rounded-md">
                          {formData.Study_Hours} hrs
                        </span>
                      </div>
                      <input
                        type="range"
                        id="studyHours"
                        min="0"
                        max="14"
                        step="0.5"
                        value={formData.Study_Hours}
                        onChange={(e) => handleSliderChange("studyHours", parseFloat(e.target.value))}
                        className="w-full cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-semibold text-[#525851]">
                        <span>0 hrs</span>
                        <span>7 hrs</span>
                        <span>14 hrs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Lifestyle & Physical Health */}
              <div className="bg-white rounded-2xl p-5 card-shadow border border-[#EFEADF] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-1.5 rounded-lg bg-[#FAF8F5] text-[#4A7C59] border border-[#EFEADF]">
                      <Sprout className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2D312E]">Lifestyle & Health</h3>
                      <p className="text-[11px] font-medium text-[#525851]">Rest and movement habits</p>
                    </div>
                  </div>

                  <div className="space-y-3 mt-4">
                    <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EFEADF] space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D312E]">
                          <Moon className="w-3.5 h-3.5 text-[#4A7C59]" />
                          <span>Sleep Hours / Night</span>
                        </div>
                        <span className="text-xs font-bold text-[#4A7C59] bg-[#EAE4D5] px-2 py-0.5 rounded-md">
                          {formData.Sleep_Hours_Per_Night} hrs
                        </span>
                      </div>
                      <input
                        type="range"
                        id="sleepHours"
                        min="2"
                        max="12"
                        step="0.5"
                        value={formData.Sleep_Hours_Per_Night}
                        onChange={(e) => handleSliderChange("sleepHours", parseFloat(e.target.value))}
                        className="w-full cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-semibold text-[#525851]">
                        <span>2 hrs</span>
                        <span>7 hrs</span>
                        <span>12 hrs</span>
                      </div>
                    </div>

                    <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EFEADF] space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D312E]">
                          <Activity className="w-3.5 h-3.5 text-[#4A7C59]" />
                          <span>Physical Activity</span>
                        </div>
                        <span className="text-xs font-bold text-[#4A7C59] bg-[#EAE4D5] px-2 py-0.5 rounded-md">
                          {formData.Physical_Activity_Hours} hrs
                        </span>
                      </div>
                      <input
                        type="range"
                        id="physicalActivity"
                        min="0"
                        max="5"
                        step="0.5"
                        value={formData.Physical_Activity_Hours}
                        onChange={(e) => handleSliderChange("physicalActivity", parseFloat(e.target.value))}
                        className="w-full cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-semibold text-[#525851]">
                        <span>0 hrs</span>
                        <span>2.5 hrs</span>
                        <span>5 hrs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Digital Life & Screen Habits */}
              <div className="bg-white rounded-2xl p-5 card-shadow border border-[#EFEADF] flex flex-col justify-between lg:col-span-2">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-1.5 rounded-lg bg-[#FAF8F5] text-[#4A7C59] border border-[#EFEADF]">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2D312E]">Digital Life & Screen Habits</h3>
                      <p className="text-[11px] font-medium text-[#525851]">Screen exposure & platform connectivity</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    
                    <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EFEADF] space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D312E]">
                          <Clock className="w-3.5 h-3.5 text-[#4A7C59]" />
                          <span>Daily Usage Hours</span>
                        </div>
                        <span className="text-xs font-bold text-[#4A7C59] bg-[#EAE4D5] px-2 py-0.5 rounded-md">
                          {formData.Avg_Daily_Usage_Hours} hrs
                        </span>
                      </div>
                      <input
                        type="range"
                        id="screenTime"
                        min="0"
                        max="16"
                        step="0.5"
                        value={formData.Avg_Daily_Usage_Hours}
                        onChange={(e) => handleSliderChange("screenTime", parseFloat(e.target.value))}
                        className="w-full cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-semibold text-[#525851]">
                        <span>0 hrs</span>
                        <span>8 hrs</span>
                        <span>16 hrs</span>
                      </div>
                    </div>

                    <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EFEADF] space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-[#2D312E]">
                          <Smartphone className="w-3.5 h-3.5 text-[#4A7C59]" />
                          <span>Daily Phone Unlocks</span>
                        </div>
                        <span className="text-xs font-bold text-[#4A7C59] bg-[#EAE4D5] px-2 py-0.5 rounded-md">
                          {formData.Daily_Unlocks} times
                        </span>
                      </div>
                      <input
                        type="range"
                        id="socialMedia"
                        min="10"
                        max="250"
                        step="5"
                        value={formData.Daily_Unlocks}
                        onChange={(e) => handleSliderChange("socialMedia", parseInt(e.target.value))}
                        className="w-full cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-semibold text-[#525851]">
                        <span>10</span>
                        <span>130 times</span>
                        <span>250+</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#2D312E] mb-1">Most Used Platform</label>
                      <select
                        id="Most_Used_Platform"
                        value={formData.Most_Used_Platform}
                        onChange={handleInputChange}
                        className="input-warm w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-[#2D312E]"
                      >
                        {platforms.length > 0 ? (
                          platforms.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))
                        ) : (
                          <option value="Instagram">Instagram</option>
                        )}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#2D312E] mb-1">Primary Purpose of Use</label>
                      <select
                        id="Purpose_Of_Use"
                        value={formData.Purpose_Of_Use}
                        onChange={handleInputChange}
                        className="input-warm w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-[#2D312E]"
                      >
                        {purposes.length > 0 ? (
                          purposes.map(p => (
                            <option key={p} value={p}>{p}</option>
                          ))
                        ) : (
                          <option value="Education">Education</option>
                        )}
                      </select>
                    </div>

                  </div>
                </div>
              </div>

              {/* Card 5: Mental Wellness */}
              <div className="bg-white rounded-2xl p-5 card-shadow border border-[#EFEADF] flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-1.5 rounded-lg bg-[#FAF8F5] text-[#4A7C59] border border-[#EFEADF]">
                      <Brain className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2D312E]">Mental Wellness</h3>
                      <p className="text-[11px] font-medium text-[#525851]">Self-reported stress indicator</p>
                    </div>
                  </div>

                  <div className="space-y-4 mt-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#2D312E] mb-1 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-rose-500" />
                        <span>Self-Reported Stress Level</span>
                      </label>
                      <select
                        id="stressLevel"
                        value={formData.Stress_Level}
                        onChange={handleInputChange}
                        className="input-warm w-full px-3 py-2.5 rounded-xl text-xs font-semibold text-[#2D312E]"
                      >
                        <option value="Low">Low</option>
                        <option value="Moderate">Moderate</option>
                        <option value="High">High</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Assessment Submit Button */}
            <div className="bg-white rounded-2xl p-5 card-shadow border border-[#EFEADF] flex items-center justify-center mt-6">
              <button
                type="submit"
                className="w-full sm:w-auto py-3.5 px-8 rounded-xl font-semibold text-sm text-white bg-[#4A7C59] hover:bg-[#3E684A] active:scale-[0.99] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Get My MindWell Check-in</span>
              </button>
            </div>
          </form>
        </section>

        {/* ==================== PAGE 3: LOADING TRANSITION ==================== */}
        <section
          id="pageLoading"
          className={`w-full max-w-md fade-in-slide py-12 text-center ${
            step === "loading" ? "" : "hidden"
          }`}
        >
          <div className="bg-white rounded-2xl p-10 card-shadow border border-[#EFEADF] flex flex-col items-center justify-center space-y-6">
            
            {/* Logo spinner */}
            <div className="w-14 h-14 rounded-2xl bg-[#4A7C59] flex items-center justify-center text-white font-bold text-lg shadow-md loading-pulse-ring">
              <HeartHandshake className="w-7 h-7" />
            </div>
            
            {/* Appraisal */}
            <div className="space-y-1.5 text-center">
              <h3 className="text-lg font-bold tracking-tight text-[#2D312E]">MindWell</h3>
              <p id="loadingPersonalText" className="text-xs sm:text-sm font-semibold text-[#4A7C59] pt-1">
                {userName ? `${userName}, you took the first step ❤️` : "You took the first step ❤️"}
              </p>
              <p className="text-[11px] text-slate-500 mt-2 h-8 font-medium">
                {loadingMessage}
              </p>
            </div>

            {/* Pulse line */}
            <div className="w-36 bg-[#FAF8F5] h-1.5 rounded-full overflow-hidden border border-[#EFEADF]">
              <div className="h-full bg-[#4A7C59] rounded-full animate-pulse w-2/3 mx-auto"></div>
            </div>
          </div>
        </section>

        {/* ==================== PAGE 4: RESULTS VIEW ==================== */}
        <section
          id="pageResult"
          className={`w-full max-w-4xl fade-in-slide py-4 text-left ${
            step === "result" ? "" : "hidden"
          }`}
        >
          <div className="bg-white rounded-2xl p-5 sm:p-7 card-shadow border border-[#EFEADF] space-y-5">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EFEADF] pb-3.5">
              <div>
                <span className="text-[11px] font-bold text-[#4A7C59] uppercase tracking-wider block mb-0.5">Assessment Result</span>
                <h2 id="assessmentResultHeader" className="text-lg sm:text-xl font-bold text-[#2D312E]">{userName ? `${userName}'s` : "Your"} MindWell Check-in</h2>
              </div>
              <button
                onClick={resetAssessment}
                className="text-xs font-semibold text-[#374151] hover:text-[#2D312E] flex items-center gap-1.5 bg-[#FAF8F5] hover:bg-[#EFEADF] px-3.5 py-2 rounded-xl border border-[#E6E0D4] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Update My Habits
              </button>
            </div>

            {/* API Connection Warning block */}
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-700 rounded-xl p-4 flex items-start gap-3 text-xs font-semibold">
                <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Prediction Outcome Card */}
            <div
              id="resultCard"
              className={`p-5 sm:p-6 rounded-2xl border transition-all flex flex-col items-center text-center space-y-2.5 ${details.colorClass}`}
            >
              {/* Emoji indicator */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border border-[#E6E0D4] flex items-center justify-center text-2xl sm:text-3xl shadow-sm select-none mb-0.5">
                <span id="resultEmoji">{details.emoji}</span>
              </div>

              {/* Level Details */}
              <div className="space-y-1.5 max-w-xl flex flex-col items-center">
                <h3 id="resultTitle" className="text-lg sm:text-xl font-bold tracking-tight">
                  {details.title}
                </h3>
                <p id="resultSubline" className={`text-xs sm:text-sm font-semibold opacity-90 ${
                  currentPrediction === "good" 
                    ? "text-[#3E684A]" 
                    : currentPrediction === "low" 
                      ? "text-[#A85B3B]" 
                      : "text-[#8C5E38]"
                }`}>
                  {details.subtitle}
                </p>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white/40 border border-black/5 px-3 py-1 rounded-full mt-1.5">
                  Confidence: {result ? Math.round(result.confidence * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Lifestyle Metrics list */}
            <div className="space-y-2.5 pt-0.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#2D312E] uppercase tracking-wider">Lifestyle Metrics</h3>
                <span className="text-[11px] font-medium text-[#525851]">Daily habit snapshot</span>
              </div>

              <div id="lifestyleMetricsGrid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                
                {/* Metric 1: Screen Time */}
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EFEADF] flex flex-col justify-between space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] shrink-0">
                      <Smartphone className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#2D312E] truncate">Screen Time</span>
                  </div>
                  <div>
                    <div className="text-base font-bold text-[#2D312E] tracking-tight mb-0.5">{formData.Avg_Daily_Usage_Hours} hrs</div>
                    <div className="text-[11px] font-medium text-[#525851] truncate">
                      {formData.Avg_Daily_Usage_Hours <= 4 ? "Balanced Usage" : (formData.Avg_Daily_Usage_Hours <= 6 ? "Moderate Scrolling" : "High Exposure")}
                    </div>
                  </div>
                  <div className="relative w-full py-0.5">
                    <div className="w-full h-1.5 bg-[#EAE4D5] rounded-full relative">
                      <div className="h-full bg-[#3B82F6] rounded-full" style={{ width: `${Math.min(100, Math.max(10, (formData.Avg_Daily_Usage_Hours / 16) * 100))}%` }}></div>
                      <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#2563EB] border-2 border-white shadow-sm" style={{ left: `calc(${Math.min(100, Math.max(10, (formData.Avg_Daily_Usage_Hours / 16) * 100))}% - 6px)` }}></div>
                    </div>
                  </div>
                </div>

                {/* Metric 2: Study Hours */}
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EFEADF] flex flex-col justify-between space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#F0FDF4] flex items-center justify-center text-[#16A34A] shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#2D312E] truncate">Study Hours</span>
                  </div>
                  <div>
                    <div className="text-base font-bold text-[#2D312E] tracking-tight mb-0.5">{formData.Study_Hours} hrs</div>
                    <div className="text-[11px] font-medium text-[#525851] truncate">
                      {formData.Study_Hours <= 3 ? "Light Focus" : (formData.Study_Hours <= 6 ? "Solid Effort" : "Heavy Focus")}
                    </div>
                  </div>
                  <div className="relative w-full py-0.5">
                    <div className="w-full h-1.5 bg-[#EAE4D5] rounded-full relative">
                      <div className="h-full bg-[#22C55E] rounded-full" style={{ width: `${Math.min(100, Math.max(10, (formData.Study_Hours / 14) * 100))}%` }}></div>
                      <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#16A34A] border-2 border-white shadow-sm" style={{ left: `calc(${Math.min(100, Math.max(10, (formData.Study_Hours / 14) * 100))}% - 6px)` }}></div>
                    </div>
                  </div>
                </div>

                {/* Metric 3: Sleep Hours */}
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EFEADF] flex flex-col justify-between space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] shrink-0">
                      <Moon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#2D312E] truncate">Sleep</span>
                  </div>
                  <div>
                    <div className="text-base font-bold text-[#2D312E] tracking-tight mb-0.5">{formData.Sleep_Hours_Per_Night} hrs</div>
                    <div className="text-[11px] font-medium text-[#525851] truncate">
                      {formData.Sleep_Hours_Per_Night >= 7.5 ? "Well Rested" : (formData.Sleep_Hours_Per_Night >= 6.5 ? "Acceptable Recharge" : "Needs Recharge")}
                    </div>
                  </div>
                  <div className="relative w-full py-0.5">
                    <div className="w-full h-1.5 bg-[#EAE4D5] rounded-full relative">
                      <div className="h-full bg-[#6366F1] rounded-full" style={{ width: `${Math.min(100, Math.max(10, (formData.Sleep_Hours_Per_Night / 12) * 100))}%` }}></div>
                      <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#4F46E5] border-2 border-white shadow-sm" style={{ left: `calc(${Math.min(100, Math.max(10, (formData.Sleep_Hours_Per_Night / 12) * 100))}% - 6px)` }}></div>
                    </div>
                  </div>
                </div>

                {/* Metric 4: Physical Activity */}
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EFEADF] flex flex-col justify-between space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#ECFDF5] flex items-center justify-center text-[#059669] shrink-0">
                      <Activity className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#2D312E] truncate">Activity</span>
                  </div>
                  <div>
                    <div className="text-base font-bold text-[#2D312E] tracking-tight mb-0.5">{formData.Physical_Activity_Hours} hrs</div>
                    <div className="text-[11px] font-medium text-[#525851] truncate">
                      {formData.Physical_Activity_Hours >= 2 ? "Active Routine" : (formData.Physical_Activity_Hours >= 0.5 ? "Keep Moving" : "Light Movement")}
                    </div>
                  </div>
                  <div className="relative w-full py-0.5">
                    <div className="w-full h-1.5 bg-[#EAE4D5] rounded-full relative">
                      <div className="h-full bg-[#10B981] rounded-full" style={{ width: `${Math.min(100, Math.max(10, (formData.Physical_Activity_Hours / 5) * 100))}%` }}></div>
                      <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#059669] border-2 border-white shadow-sm" style={{ left: `calc(${Math.min(100, Math.max(10, (formData.Physical_Activity_Hours / 5) * 100))}% - 6px)` }}></div>
                    </div>
                  </div>
                </div>

                {/* Metric 5: Stress Index */}
                <div className="bg-[#FAF8F5] p-3 rounded-xl border border-[#EFEADF] flex flex-col justify-between space-y-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#F5F3FF] flex items-center justify-center text-[#7C3AED] shrink-0">
                      <Brain className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#2D312E] truncate">Stress Index</span>
                  </div>
                  <div>
                    <div className="text-base font-bold text-[#2D312E] tracking-tight mb-0.5">{formData.Stress_Level}</div>
                    <div className="text-[11px] font-medium text-[#525851] truncate">{getStressProgress(formData.Stress_Level).insight}</div>
                  </div>
                  <div className="relative w-full py-0.5">
                    <div className="w-full h-1.5 bg-[#EAE4D5] rounded-full relative">
                      <div className={`h-full ${getStressProgress(formData.Stress_Level).color} rounded-full`} style={{ width: `${getStressProgress(formData.Stress_Level).percent}%` }}></div>
                      <div className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full ${getStressProgress(formData.Stress_Level).thumb} border-2 border-white shadow-sm`} style={{ left: `calc(${getStressProgress(formData.Stress_Level).percent}% - 6px)` }}></div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Note / Step Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              
              {/* Note */}
              <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EFEADF] space-y-1.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-[#4A7C59]" />
                    <h3 className="text-xs font-bold text-[#2D312E] uppercase tracking-wider">MindWell Note</h3>
                  </div>
                  <p id="mindWellNoteText" className="text-xs sm:text-sm font-medium text-[#374151] leading-relaxed">
                    {details.note}
                  </p>
                </div>
              </div>

              {/* Step Habit */}
              <div className="bg-white rounded-2xl p-4 border border-[#EFEADF] border-l-4 border-l-[#4A7C59] flex flex-col justify-between shadow-sm space-y-1.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-[#4A7C59] uppercase tracking-wider">Your Next Small Step</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#FAF8F5] border border-[#EFEADF] text-[10px] font-semibold text-[#525851] shrink-0">
                      Focus Habit
                    </span>
                  </div>
                  <p id="focusPointText" className="text-xs sm:text-sm font-semibold text-[#2D312E]">
                    {getFocusHabit()}
                  </p>
                </div>
              </div>

            </div>

            {/* Support Suggestions & Thank You */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 items-stretch pt-0.5">
              
              {/* Left Suggestions */}
              <div className="bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 card-shadow border border-[#EFEADF] flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-xs font-bold text-[#2D312E] uppercase tracking-wider mb-2.5">Supportive Suggestions</h3>
                  <div id="recommendationsList" className="space-y-2">
                    {suggestions.map((text, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-[#EFEADF] text-center">
                        <p className="text-xs text-[#374151] font-medium leading-relaxed">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Thank You */}
              <div className="bg-[#FAF8F5] rounded-2xl p-4 sm:p-5 card-shadow border border-[#EFEADF] flex flex-col justify-between text-center space-y-3">
                <div className="flex flex-col items-center justify-center h-full space-y-2">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-[#F2F7F3] border border-[#D4E5D7] text-[#4A7C59] shadow-sm mb-0.5">
                    <Heart className="w-4 h-4 fill-[#4A7C59]/20" />
                  </div>
                  <div id="thankYouMessageText" className="space-y-1">
                    <div className="font-bold text-xs sm:text-sm text-[#2D312E]">Thank you{userName ? `, ${userName}` : ""} ❤️</div>
                    <p className="text-[11px] sm:text-xs font-medium text-[#374151] leading-relaxed">We hope MindWell helped you understand your habits better.</p>
                    <p className="text-[11px] sm:text-xs font-medium text-[#374151] leading-relaxed">Keep trying, keep growing, and keep becoming the best version of yourself.</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Disclaimer */}
            <div className="pt-3 border-t border-[#EFEADF] text-center">
              <p className="text-[11px] text-[#525851] font-medium leading-relaxed max-w-lg mx-auto">
                This check-in is for self-reflection and awareness. For professional support, consider reaching out to university counseling services.
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* ==================== FOOTER ==================== */}
      <footer className="mt-6 mb-3 text-center text-[11px] font-medium text-[#525851]">
        MindWell Predictor • Personal AI Companion Check-In
      </footer>
      
    </div>
  );
}
