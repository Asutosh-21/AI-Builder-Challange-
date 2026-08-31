import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mission Anomaly Copilot — AI Spacecraft Intelligence",
  description:
    "AI-powered spacecraft telemetry anomaly detection and mission response planning. Built with IBM Granite + watsonx.ai.",
  keywords: ["spacecraft", "telemetry", "anomaly detection", "IBM Granite", "mission control", "AI"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
