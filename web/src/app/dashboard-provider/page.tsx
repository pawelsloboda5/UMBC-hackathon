"use client";

import React, { useState } from "react";
import StatsCard from "@/components/StatsCard";
import ActivityFeed from "@/components/ActivityFeed";
import ProgressBar from "@/components/ProgressBar";
import StatusBadge from "@/components/StatusBadge";

type Health = { status?: string; db?: boolean };

export default function DashboardProviderPage() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [health, setHealth] = useState<Health>({ status: "down", db: false });
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

  const api =
    (process.env.NEXT_RUNTIME === "nodejs"
      ? process.env.INTERNAL_API_URL
      : process.env.NEXT_PUBLIC_API_URL) || "http://localhost:8000";

  // Fetch health data on component mount
  React.useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch(`${api}/health`, { cache: "no-store" });
        const healthData = await res.json();
        setHealth(healthData);
      } catch {
        setHealth({ status: "down", db: false });
      }
    };
    fetchHealth();
  }, [api]);

  const apiOk = health.status === "ok";
  const dbOk = Boolean(health.db);

  // Mock data for dashboard - in a real app, this would come from API calls
  const stats = {
    totalScans: 1247,
    phishingDetected: 89,
    benignEmails: 1158,
    avgProcessingTime: "2.3s"
  };

  const recentActivity = [
    { id: 1, type: "scan" as const, email: "user@example.com", result: "phishing" as const, timestamp: "2 minutes ago" },
    { id: 2, type: "scan" as const, email: "admin@company.com", result: "benign" as const, timestamp: "5 minutes ago" },
    { id: 3, type: "scan" as const, email: "support@service.com", result: "suspicious" as const, timestamp: "8 minutes ago" },
    { id: 4, type: "scan" as const, email: "newsletter@news.com", result: "benign" as const, timestamp: "12 minutes ago" },
    { id: 5, type: "scan" as const, email: "urgent@bank.com", result: "phishing" as const, timestamp: "15 minutes ago" },
  ];

  const emailExamples = [
    {
      id: "email-1",
      sender: "security@paypal.com",
      receiver: "user@example.com",
      date: "2024-01-15 14:30:25",
      subject: "Urgent: Verify Your Account Immediately",
      body: "Dear Customer,\n\nWe have detected suspicious activity on your PayPal account. To protect your account, please verify your identity by clicking the link below:\n\nhttps://paypal-security-verification.com/verify\n\nIf you do not verify your account within 24 hours, it will be suspended.\n\nBest regards,\nPayPal Security Team",
      label: "phishing",
      confidence: 0.95
    },
    {
      id: "email-2",
      sender: "noreply@github.com",
      receiver: "developer@company.com",
      date: "2024-01-15 10:15:42",
      subject: "Pull Request #1234 has been merged",
      body: "Hi there,\n\nYour pull request \"Fix authentication bug\" has been successfully merged into the main branch.\n\nYou can view the changes at:\nhttps://github.com/company/repo/pull/1234\n\nThanks for your contribution!\n\nGitHub",
      label: "benign",
      confidence: 0.98
    },
    {
      id: "email-3",
      sender: "support@microsoft.com",
      receiver: "admin@company.com",
      date: "2024-01-15 09:45:18",
      subject: "Your Office 365 subscription is expiring soon",
      body: "Hello,\n\nYour Office 365 Business Premium subscription will expire on January 30, 2024.\n\nTo continue using our services without interruption, please renew your subscription by visiting:\nhttps://admin.microsoft.com/billing\n\nIf you have any questions, please contact our support team.\n\nMicrosoft Support",
      label: "suspicious",
      confidence: 0.72
    },
    {
      id: "email-4",
      sender: "newsletter@techcrunch.com",
      receiver: "reader@example.com",
      date: "2024-01-15 08:00:00",
      subject: "Weekly Tech News Roundup - AI Breakthroughs",
      body: "This week in tech:\n\n• OpenAI releases GPT-5 with enhanced reasoning capabilities\n• Tesla announces new autonomous driving features\n• Google unveils quantum computing breakthrough\n\nRead the full articles on our website.\n\nUnsubscribe | Privacy Policy",
      label: "benign",
      confidence: 0.99
    },
    {
      id: "email-5",
      sender: "urgent@bank-security.com",
      receiver: "customer@example.com",
      date: "2024-01-15 16:22:33",
      subject: "🚨 CRITICAL: Unauthorized Access Detected",
      body: "URGENT SECURITY ALERT\n\nWe have detected unauthorized access to your bank account from an unknown device.\n\nTo secure your account immediately, click here:\nhttps://bank-security-verification.net/secure\n\nDo not ignore this message. Your account may be compromised.\n\nBank Security Department",
      label: "phishing",
      confidence: 0.89
    }
  ];

  const tabs = [
    { id: "analytics", label: "Analytics" },
    { id: "ctf", label: "Capture the Flag" }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "analytics":
        return <AnalyticsTab 
          stats={stats} 
          recentActivity={recentActivity} 
          emailExamples={emailExamples}
          selectedEmail={selectedEmail}
          setSelectedEmail={setSelectedEmail}
          apiOk={apiOk} 
          dbOk={dbOk} 
        />;
      case "ctf":
        return <CaptureTheFlagTab />;
      default:
        return <AnalyticsTab 
          stats={stats} 
          recentActivity={recentActivity} 
          emailExamples={emailExamples}
          selectedEmail={selectedEmail}
          setSelectedEmail={setSelectedEmail}
          apiOk={apiOk} 
          dbOk={dbOk} 
        />;
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-3">
            <StatusBadge status={apiOk} trueLabel="API: ok" falseLabel="API: down" />
            <StatusBadge status={dbOk} trueLabel="DB: ok" falseLabel="DB: down" />
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </main>
  );
}

// Analytics Tab Component
function AnalyticsTab({ 
  stats, 
  recentActivity, 
  emailExamples, 
  selectedEmail, 
  setSelectedEmail, 
  apiOk, 
  dbOk 
}: {
  stats: any;
  recentActivity: any[];
  emailExamples: any[];
  selectedEmail: string | null;
  setSelectedEmail: (id: string | null) => void;
  apiOk: boolean;
  dbOk: boolean;
}) {
  const getLabelBadge = (label: string, confidence: number) => {
    const styles = {
      phishing: "bg-red-100 text-red-700 border-red-200",
      suspicious: "bg-yellow-100 text-yellow-700 border-yellow-200",
      benign: "bg-green-100 text-green-700 border-green-200"
    };
    return `inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[label as keyof typeof styles] || styles.benign}`;
  };

  const selectedEmailData = emailExamples.find(email => email.id === selectedEmail);

  if (selectedEmail && selectedEmailData) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <button
          onClick={() => setSelectedEmail(null)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Email List
        </button>

        {/* Email Detail View */}
        <section className="rounded-2xl border bg-white/60 dark:bg-slate-900/40 backdrop-blur p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-xl font-semibold">Email Analysis</h2>
            <div className="flex items-center gap-2">
              <span className={getLabelBadge(selectedEmailData.label, selectedEmailData.confidence)}>
                {selectedEmailData.label}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {(selectedEmailData.confidence * 100).toFixed(1)}% confidence
              </span>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Email Metadata */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">From</label>
                <p className="text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                  {selectedEmailData.sender}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">To</label>
                <p className="text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                  {selectedEmailData.receiver}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                <p className="text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                  {selectedEmailData.date}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                <p className="text-sm text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-800 p-2 rounded">
                  {selectedEmailData.subject}
                </p>
              </div>
            </div>

            {/* Email Body */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email Body</label>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg max-h-96 overflow-y-auto">
                <pre className="text-sm text-slate-900 dark:text-slate-100 whitespace-pre-wrap font-sans">
                  {selectedEmailData.body}
                </pre>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-medium mb-4">Analysis Results</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Risk Level</h4>
                <p className={`text-sm font-medium ${
                  selectedEmailData.label === 'phishing' ? 'text-red-600' :
                  selectedEmailData.label === 'suspicious' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {selectedEmailData.label === 'phishing' ? 'High Risk' :
                   selectedEmailData.label === 'suspicious' ? 'Medium Risk' : 'Low Risk'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Confidence Score</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {(selectedEmailData.confidence * 100).toFixed(1)}%
                </p>
              </div>
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Recommended Action</h4>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {selectedEmailData.label === 'phishing' ? 'Block & Report' :
                   selectedEmailData.label === 'suspicious' ? 'Review Manually' : 'Allow'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Statistics Cards */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Scans"
          value={stats.totalScans}
          color="blue"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        <StatsCard
          title="Phishing Detected"
          value={stats.phishingDetected}
          color="red"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
        />
        <StatsCard
          title="Benign Emails"
          value={stats.benignEmails}
          color="green"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </section>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Email Examples List */}
        <div className="lg:col-span-2">
          <section className="rounded-2xl border bg-white/60 dark:bg-slate-900/40 backdrop-blur p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Email Examples</h2>
            <div className="space-y-3">
              {emailExamples.map((email) => (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email.id)}
                  className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                        {email.subject}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        From: {email.sender} • To: {email.receiver}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <span className={getLabelBadge(email.label, email.confidence)}>
                        {email.label}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {(email.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {email.date}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                    {email.body.substring(0, 100)}...
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* System Status & Quick Actions */}
        <div className="space-y-6">
          {/* System Status */}
          <section className="rounded-2xl border bg-white/60 dark:bg-slate-900/40 backdrop-blur p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">API Server</span>
                <StatusBadge status={apiOk} trueLabel="Online" falseLabel="Offline" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">Database</span>
                <StatusBadge status={dbOk} trueLabel="Connected" falseLabel="Disconnected" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">Processing Queue</span>
                <StatusBadge status={true} trueLabel="Active" falseLabel="Inactive" />
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="rounded-2xl border bg-white/60 dark:bg-slate-900/40 backdrop-blur p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 active:scale-[.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 text-sm">
                New Email Scan
              </button>
              <button className="w-full rounded-lg border px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm">
                View All Scans
              </button>
              <button className="w-full rounded-lg border px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm">
                Export Report
              </button>
            </div>
          </section>

          {/* Performance Metrics */}
          <section className="rounded-2xl border bg-white/60 dark:bg-slate-900/40 backdrop-blur p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Performance</h2>
            <div className="space-y-4">
              <ProgressBar label="Accuracy Rate" value={94.2} color="green" />
              <ProgressBar label="Uptime" value={99.8} color="blue" />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

// Capture the Flag Tab Component
function CaptureTheFlagTab() {
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [flag, setFlag] = useState("");
  const [submissionResult, setSubmissionResult] = useState<"success" | "error" | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const challengesPerPage = 4;

  const challenges = [
    {
      id: "email-analysis",
      title: "Email Analysis Challenge",
      description: "Analyze the provided email and identify if it's a phishing attempt. Find the hidden flag in the analysis.",
      difficulty: "Easy",
      points: 100,
      category: "Email Security"
    },
    {
      id: "pii-detection",
      title: "PII Detection Challenge",
      description: "Use the PII detection system to find personally identifiable information in the given text. Extract the flag from the results.",
      difficulty: "Medium",
      points: 200,
      category: "Data Privacy"
    },
    {
      id: "system-penetration",
      title: "System Penetration Challenge",
      description: "Test the system's security by attempting to bypass the email scanning system. The flag is hidden in the system logs.",
      difficulty: "Hard",
      points: 500,
      category: "System Security"
    },
    {
      id: "sql-injection",
      title: "SQL Injection Challenge",
      description: "Find and exploit SQL injection vulnerabilities in the email database. The flag is hidden in the database schema.",
      difficulty: "Medium",
      points: 300,
      category: "Web Security"
    },
    {
      id: "xss-attack",
      title: "Cross-Site Scripting (XSS)",
      description: "Identify and exploit XSS vulnerabilities in the email preview system. Look for the flag in the DOM.",
      difficulty: "Medium",
      points: 250,
      category: "Web Security"
    },
    {
      id: "crypto-challenge",
      title: "Cryptography Challenge",
      description: "Decrypt the encoded email content using various cryptographic techniques. The flag is hidden in the decrypted message.",
      difficulty: "Hard",
      points: 400,
      category: "Cryptography"
    },
    {
      id: "network-analysis",
      title: "Network Traffic Analysis",
      description: "Analyze network packets to identify suspicious email traffic patterns. The flag is in the packet data.",
      difficulty: "Medium",
      points: 350,
      category: "Network Security"
    },
    {
      id: "reverse-engineering",
      title: "Reverse Engineering Challenge",
      description: "Reverse engineer the email scanning algorithm to understand its vulnerabilities. Find the flag in the source code.",
      difficulty: "Hard",
      points: 600,
      category: "Reverse Engineering"
    },
    {
      id: "forensics",
      title: "Digital Forensics Challenge",
      description: "Investigate a compromised email account and trace the attack vector. The flag is in the forensic evidence.",
      difficulty: "Hard",
      points: 450,
      category: "Digital Forensics"
    },
    {
      id: "social-engineering",
      title: "Social Engineering Challenge",
      description: "Create a convincing phishing email that bypasses the detection system. The flag is in the success message.",
      difficulty: "Easy",
      points: 150,
      category: "Social Engineering"
    },
    {
      id: "api-exploitation",
      title: "API Exploitation Challenge",
      description: "Find and exploit vulnerabilities in the email API endpoints. The flag is in the API response.",
      difficulty: "Medium",
      points: 275,
      category: "API Security"
    },
    {
      id: "machine-learning",
      title: "ML Model Evasion",
      description: "Craft an email that evades the machine learning detection model. The flag is in the evasion success response.",
      difficulty: "Hard",
      points: 550,
      category: "Machine Learning"
    }
  ];

  const handleFlagSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock flag validation
    if (flag.toLowerCase().includes("flag")) {
      setSubmissionResult("success");
    } else {
      setSubmissionResult("error");
    }
    setTimeout(() => setSubmissionResult(null), 3000);
  };

  // Pagination logic
  const totalPages = Math.ceil(challenges.length / challengesPerPage);
  const startIndex = (currentPage - 1) * challengesPerPage;
  const endIndex = startIndex + challengesPerPage;
  const currentChallenges = challenges.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedChallenge(null); // Clear selection when changing pages
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800 border-green-200";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Hard": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Challenge Selection */}
      <section className="rounded-2xl border bg-white/60 dark:bg-slate-900/40 backdrop-blur p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Available Challenges</h2>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {challenges.length} challenges available
          </div>
        </div>
        
        {/* Challenge Grid */}
        <div className="grid gap-4 md:grid-cols-2 mb-6">
          {currentChallenges.map((challenge) => (
            <div
              key={challenge.id}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedChallenge === challenge.id
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600 hover:shadow-sm"
              }`}
              onClick={() => setSelectedChallenge(challenge.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">{challenge.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{challenge.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getDifficultyColor(challenge.difficulty)}`}>
                    {challenge.difficulty}
                  </span>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{challenge.points} pts</span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  {challenge.category}
                </span>
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Click to select</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Showing {startIndex + 1}-{Math.min(endIndex, challenges.length)} of {challenges.length} challenges
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 text-sm rounded-md ${
                    currentPage === page
                      ? "bg-blue-600 text-white"
                      : "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Flag Submission */}
      {selectedChallenge && (
        <section className="rounded-2xl border bg-white/60 dark:bg-slate-900/40 backdrop-blur p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Flag Submission</h2>
          <form onSubmit={handleFlagSubmission} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Enter your flag:
              </label>
              <input
                type="text"
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                placeholder="UMBC{...}"
                className="w-full rounded-md border border-slate-300 px-3 py-2 bg-white dark:bg-slate-900 dark:border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Submit Flag
            </button>
            {submissionResult && (
              <div className={`mt-3 p-3 rounded-md ${
                submissionResult === "success" 
                  ? "bg-green-50 text-green-800 border border-green-200" 
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}>
                {submissionResult === "success" ? "✅ Flag accepted! Well done!" : "❌ Incorrect flag. Try again!"}
              </div>
            )}
          </form>
        </section>
      )}

      {/* Leaderboard */}
      <section className="rounded-2xl border bg-white/60 dark:bg-slate-900/40 backdrop-blur p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Leaderboard</h2>
          <div className="text-sm text-slate-500 dark:text-slate-400">
            Top 10 players
          </div>
        </div>
        <div className="max-h-80 overflow-y-scroll space-y-2 ctf-scrollable">
          {[
            { rank: 1, name: "HackerOne", points: 2850, challenges: 8, avatar: "🛡️" },
            { rank: 2, name: "CyberNinja", points: 2400, challenges: 7, avatar: "🥷" },
            { rank: 3, name: "SecurityPro", points: 1950, challenges: 6, avatar: "🔒" },
            { rank: 4, name: "CodeBreaker", points: 1650, challenges: 5, avatar: "💻" },
            { rank: 5, name: "FlagHunter", points: 1400, challenges: 4, avatar: "🏴" },
            { rank: 6, name: "PhishMaster", points: 1200, challenges: 4, avatar: "🎣" },
            { rank: 7, name: "CryptoWiz", points: 950, challenges: 3, avatar: "🔐" },
            { rank: 8, name: "NetSecGuru", points: 800, challenges: 3, avatar: "🌐" },
            { rank: 9, name: "BugBounty", points: 650, challenges: 2, avatar: "🐛" },
            { rank: 10, name: "WhiteHat", points: 500, challenges: 2, avatar: "🤍" }
          ].map((player) => (
            <div key={player.rank} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    player.rank === 1 
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                      : player.rank === 2
                      ? "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                      : player.rank === 3
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  }`}>
                    {player.rank}
                  </span>
                  <span className="text-lg">{player.avatar}</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{player.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{player.challenges} challenges completed</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-medium text-blue-600 dark:text-blue-400">{player.points} pts</span>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {player.rank <= 3 ? "🏆" : player.rank <= 10 ? "⭐" : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Your rank indicator */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <div className="flex items-center gap-2">
              <span className="text-sm">👤</span>
              <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Your Rank</span>
            </div>
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">#15 - 250 pts</span>
          </div>
        </div>
      </section>
    </div>
  );
}
