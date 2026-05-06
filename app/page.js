// app/page.js
"use client";

import { useState } from "react";
import OutputPanel from "./components/OutputPanel";

export default function Home() {
  const [rawText, setRawText] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [toggles, setToggles] = useState({
    summary: false,
    flashcard: false,
    todo: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [output, setOutput] = useState(`## Judul Catatan

  Ini adalah **contoh hasil** dari AI.

  ### Poin Penting
  - Item pertama yang penting
  - Item kedua dengan \`kode inline\`

  > Ini adalah blockquote kutipan penting

  ### ✅ To-Do List
  - [ ] Task pertama
  - [ ] Task kedua
  `);

  const handleToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleGenerate = async () => {
    if (!rawText.trim() || isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText,
          toggles,
          customPrompt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Gagal generate note");
      }

      setOutput(data.markdown || "");
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat generate note");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      {/* HEADER */}
      <header className="border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold text-emerald-400 tracking-tight">
          ✦ MarkMind
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Smart Markdown Note Generator
        </p>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* ===== PANEL KIRI ===== */}
        <div className="w-1/2 border-r border-gray-800 p-6 flex flex-col gap-5">
          {/* 1. Raw Text Area */}
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-sm font-semibold text-gray-300">
              📋 Tempel Teks Mentahmu
            </label>
            <textarea
              className="{flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-200
                         placeholder-gray-600 resize-none focus:outline-none focus:border-emerald-500
                         transition-colors}"
              placeholder="Tempel catatan berantakan, transkrip rapat, atau draft apapun di sini..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
          </div>

          {/* 2. Smart Toggles */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-300">
              ⚡ Opsi Tambahan
            </label>
            <div className="flex flex-col gap-2">
              {[
                { key: "summary", label: "Buatkan Ringkasan (TL;DR) di atas" },
                { key: "flashcard", label: "Buatkan 5 Flashcard Q&A di bawah" },
                {
                  key: "todo",
                  label: "Ekstrak sebagai To-Do List (Checklist)",
                },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div
                    onClick={() => handleToggle(key)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors
                      ${
                        toggles[key]
                          ? "bg-emerald-500 border-emerald-500"
                          : "border-gray-600 group-hover:border-emerald-500"
                      }`}
                  >
                    {toggles[key] && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* 3. Custom Prompt */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-300">
              🎯 Instruksi Khusus{" "}
              <span className="text-gray-600 font-normal">(opsional)</span>
            </label>
            <input
              type="text"
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200
                         placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder='Contoh: "Gunakan gaya formal" atau "Fokus ke bagian algoritma saja"'
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </div>

          {/* 4. Generate Button */}
          <button
            disabled={!rawText.trim() || isLoading}
            onClick={handleGenerate}
            className={`w-full py-3 rounded-lg font-semibold text-sm transition-all
              ${
                !rawText.trim() || isLoading
                  ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-400 text-gray-950 cursor-pointer"
              }`}
          >
            {isLoading ? "✦ AI is thinking..." : "✦ Generate Note"}
          </button>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900 rounded-lg p-2">
              {error}
            </p>
          )}
        </div>

        {/* ===== PANEL KANAN ===== */}
        <div className="w-1/2 flex flex-col overflow-hidden p-6">
          <OutputPanel output={output} />
        </div>
      </div>
    </main>
  );
}
