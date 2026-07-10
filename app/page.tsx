"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    // Redirect to the HTML app
    window.location.href = "/app-html";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-2xl mb-4">🔄 Loading StudioVisualizer...</div>
        <div className="text-sm text-gray-500">
          If you're not redirected, <a href="/app-html" className="text-blue-500 underline">click here</a>
        </div>
      </div>
    </div>
  );
}