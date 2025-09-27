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

  const tabs = [
    { id: "analytics", label: "Analytics" },
    { id: "reports", label: "Reports" }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "analytics":
        return <AnalyticsTab stats={stats} recentActivity={recentActivity} apiOk={apiOk} dbOk={dbOk} />;
      case "reports":
        return <ReportsTab />;
      default:
        return <AnalyticsTab stats={stats} recentActivity={recentActivity} apiOk={apiOk} dbOk={dbOk} />;
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
function AnalyticsTab({ stats, recentActivity, apiOk, dbOk }: {
  stats: any;
  recentActivity: any[];
  apiOk: boolean;
  dbOk: boolean;
}) {
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
        <StatsCard
          title="Avg Processing Time"
          value={stats.avgProcessingTime}
          color="purple"
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </section>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <ActivityFeed activities={recentActivity} />
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

// Reports Tab Component
function ReportsTab() {
  return (
    <div className="space-y-8">
      <section className="rounded-2xl border bg-white/60 dark:bg-slate-900/40 backdrop-blur p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Reports</h2>
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No reports available</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Get started by generating your first report.</p>
          <div className="mt-6">
            <button className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600">
              Generate Report
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
