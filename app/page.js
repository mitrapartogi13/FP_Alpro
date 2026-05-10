// app/page.js
"use client";

import { useState, useRef, useEffect } from "react";
import OutputPanel from "./components/OutputPanel";
import History from "./components/History";

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
  const [output, setOutput] = useState(
    `## Judul Catatan\n\n  Ini adalah **contoh hasil** dari AI Markdown Generator.\n\n  ### Poin Penting\n  - Item pertama yang penting\n  - Item kedua dengan \`kode inline\`\n\n  > Ini adalah blockquote kutipan penting\n\n  ### ✅ To-Do List\n  - [ ] Task pertama\n  - [ ] Task kedua\n  `,
  );

  const [inputTab, setInputTab] = useState("text");
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfStatus, setPdfStatus] = useState("");
  const [pdfMeta, setPdfMeta] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // History state
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("markdownHistory");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history:", e);
      }
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("markdownHistory", JSON.stringify(history));
  }, [history]);

  const handleToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const processPdf = async (file) => {
    if (!file || file.type !== "application/pdf") {
      setPdfStatus("error");
      setError("File harus berformat PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPdfStatus("error");
      setError("Ukuran PDF maksimal 10 MB.");
      return;
    }

    setPdfFile(file);
    setPdfStatus("loading");
    setError("");
    setRawText("");
    setPdfMeta(null);

    const form = new FormData();
    form.append("pdf", file);

    try {
      const res = await fetch("/api/parse-pdf", { method: "POST", body: form });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textError = await res.text();
        console.error("HTML Error dari server:", textError);
        throw new Error(
          `Server error (${res.status}). Cek console browser untuk detail.`,
        );
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal membaca PDF.");

      setRawText(data.text);
      setPdfMeta({
        pages: data.pages,
        title: data.info?.title,
        author: data.info?.author,
      });
      setPdfStatus("done");
    } catch (err) {
      setPdfStatus("error");
      setError(err.message || "Gagal memproses PDF.");
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) processPdf(file);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processPdf(file);
  };

  const clearPdf = () => {
    setPdfFile(null);
    setPdfStatus("");
    setPdfMeta(null);
    setRawText("");
    setError("");
  };

  const handleGenerate = async () => {
    if (!rawText.trim() || isLoading) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText, toggles, customPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Gagal generate note");
      const markdown = data.markdown || "";
      setOutput(markdown);

      // Save to history
      const preview = markdown
        .replace(/[#*`\[\]]/g, "")
        .substring(0, 80)
        .trim();
      const title = rawText.substring(0, 40).trim() || "Untitled";
      const newItem = {
        id: Date.now(),
        title,
        preview,
        markdown,
        timestamp: new Date().toISOString(),
      };
      setHistory((prev) => [newItem, ...prev.slice(0, 49)]); // Keep last 50
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat generate note");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadHistory = (item) => {
    setOutput(item.markdown);
    setShowHistory(false);
  };

  const handleDeleteHistory = (id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const canGenerate = rawText.trim() && !isLoading;

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] text-slate-200 font-sans selection:bg-blue-500/30 flex flex-col">
      {/* header */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 px-6 py-4 shadow-lg z-10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-br from-white via-blue-200 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(59,130,246,0.4)]">
            Markdown Generator
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 font-medium">
            Smart Markdown Note Generator
          </p>
        </div>
        <div className="text-right flex flex-col items-end">
          <span className="text-xs text-slate-400 font-medium mb-0.5">
            Authors:
          </span>
          <span className="text-sm text-slate-200 font-semibold tracking-wide">
            Mitra Partogi
          </span>
          <span className="text-sm text-slate-200 font-semibold tracking-wide">
            Jalu Cahyo Sedinoputro
          </span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* panel kiri */}
        <div className="w-1/2 border-r border-white/10 p-6 flex flex-col gap-5 bg-white/[0.02] backdrop-blur-sm">
          {/* input tabs */}
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex items-center gap-1 bg-black/40 rounded-xl p-1 w-fit border border-white/5">
              <button
                onClick={() => {
                  setInputTab("text");
                  setError("");
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2
                  ${inputTab === "text" ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-400 hover:text-slate-200"}`}>
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                  />
                </svg>
                Tempel Teks
              </button>
              <button
                onClick={() => {
                  setInputTab("pdf");
                  setError("");
                }}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 flex items-center gap-2
                  ${inputTab === "pdf" ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-slate-400 hover:text-slate-200"}`}>
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                Upload PDF
              </button>
            </div>

            {/* tab teks */}
            {inputTab === "text" && (
              <div className="flex flex-col gap-2 flex-1 animate-in fade-in zoom-in-95 duration-300">
                <label className="text-sm font-semibold text-slate-300 ml-1">
                  Teks Mentahmu
                </label>
                <textarea
                  className="flex-1 bg-black/20 border border-white/10 rounded-2xl p-4 text-sm text-slate-200
                             placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50
                             focus:border-blue-500/50 transition-all shadow-inner backdrop-blur-sm min-h-48"
                  placeholder="Tempel catatan berantakan, transkrip rapat, atau draft apapun di sini..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                />
              </div>
            )}

            {/* tab pdf */}
            {inputTab === "pdf" && (
              <div className="flex flex-col gap-3 flex-1 animate-in fade-in zoom-in-95 duration-300">
                <label className="text-sm font-semibold text-slate-300 ml-1">
                  Upload File PDF
                </label>

                {pdfStatus !== "done" && (
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex-1 min-h-36 flex flex-col items-center justify-center gap-3
                                border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300
                                ${isDragOver ? "border-blue-400 bg-blue-500/10 scale-[1.02]" : "border-white/10 bg-black/20 hover:border-blue-500/50 hover:bg-white/5"}
                                ${pdfStatus === "loading" ? "pointer-events-none opacity-70" : ""}`}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={handleFileInput}
                    />
                    {pdfStatus === "loading" ? (
                      <>
                        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin shadow-lg shadow-blue-500/20" />
                        <p className="text-sm font-medium text-blue-300 animate-pulse">
                          Membaca PDF...
                        </p>
                      </>
                    ) : (
                      <>
                        <svg
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1}
                          stroke="currentColor"
                          className="w-10 h-10 mb-1 opacity-50">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                          />
                        </svg>
                        <div className="text-center">
                          <p className="text-sm text-slate-200 font-semibold">
                            {isDragOver
                              ? "Lepas file di sini"
                              : "Klik atau seret file PDF"}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Maksimal 10 MB
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {pdfStatus === "done" && pdfFile && (
                  <div className="flex flex-col gap-3 flex-1 animate-in fade-in duration-300">
                    <div className="flex items-start justify-between bg-blue-500/10 border border-blue-500/20 backdrop-blur-md rounded-xl p-3 shadow-inner">
                      <div className="flex items-start gap-2">
                        <svg
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-6 h-6 text-blue-400 mt-0.5">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                          />
                        </svg>
                        <div>
                          <p className="text-sm font-semibold text-blue-300 truncate max-w-xs">
                            {pdfFile.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {pdfMeta?.pages} halaman{" "}
                            {pdfMeta?.title ? ` · ${pdfMeta.title}` : ""} ·{" "}
                            {(pdfFile.size / 1024).toFixed(0)} KB
                          </p>
                          <p className="text-xs font-medium text-blue-400 mt-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                            {rawText.length.toLocaleString()} karakter
                            terekstrak
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={clearPdf}
                        className="w-6 h-6 flex items-center justify-center rounded-full bg-black/20 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
                        title="Hapus PDF">
                        ✕
                      </button>
                    </div>

                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-xs font-medium text-slate-500 ml-1">
                        Teks hasil ekstrak · bisa diedit sebelum generate
                      </label>
                      <textarea
                        className="flex-1 bg-black/20 border border-white/10 rounded-2xl p-3 text-xs text-slate-300
                                   font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50
                                   focus:border-blue-500/50 transition-all shadow-inner backdrop-blur-sm min-h-36"
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* smart toggles */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-blue-400">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                />
              </svg>
              Opsi Tambahan{" "}
              <span className="text-slate-500 font-normal text-xs">
                (centang yang kamu inginkan)
              </span>
            </label>
            <div className="flex flex-col gap-2">
              {[
                {
                  key: "summary",
                  label: "Buatkan Ringkasan (TL;DR) dari teks saya",
                },
                { key: "flashcard", label: "Buatkan 5 Flashcard Q&A di bawah" },
                {
                  key: "todo",
                  label: "Ekstrak sebagai To-Do List (Checklist)",
                },
              ].map(({ key, label }) => (
                <label
                  key={key}
                  onClick={() => handleToggle(key)}
                  className="flex items-center gap-3 cursor-pointer group w-fit">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-300
                      ${toggles[key] ? "bg-blue-500 border-blue-500 shadow-sm shadow-blue-500/30" : "bg-black/20 border-white/20 group-hover:border-blue-400"}`}>
                    {toggles[key] && (
                      <svg
                        className="w-3 h-3 text-white animate-in zoom-in duration-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={3}>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={`text-sm transition-colors duration-300 ${toggles[key] ? "text-blue-100 font-medium" : "text-slate-400 group-hover:text-slate-200"}`}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* custom prompt */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-indigo-400">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.061zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5"
                />
              </svg>
              Instruksi Khusus{" "}
              <span className="text-slate-500 font-normal text-xs">
                (opsional)
              </span>
            </label>
            <input
              type="text"
              className="bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-slate-200
                         placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                         focus:border-blue-500/50 transition-all shadow-inner backdrop-blur-sm"
              placeholder='Contoh: "Gunakan gaya formal" atau "Fokus ke bagian algoritma"'
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />
          </div>

          {/* generate btn */}
          <button
            disabled={!canGenerate}
            onClick={handleGenerate}
            suppressHydrationWarning
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2
              ${
                !canGenerate
                  ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
                  : "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 border border-blue-500/50"
              }`}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>MEMPROSES...</span>
              </>
            ) : (
              <>
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-4 h-4">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                  />
                </svg>
                GENERATE NOTE
              </>
            )}
          </button>

          {error && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 backdrop-blur-sm rounded-xl p-3 flex items-center gap-2 shadow-inner">
                <svg
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                {error}
              </p>
            </div>
          )}
        </div>

        {/* panel kanan */}
        {/* History Section */}
        <div className="w-1/2 flex flex-col bg-white/2 backdrop-blur-sm">
          <div className="flex flex-col gap-2 p-4 border-b border-white/10">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="text-sm font-semibold text-slate-300 hover:text-blue-300 transition-colors text-left flex items-center gap-2 group">
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">
                {showHistory ? "▼" : "▶"}
              </span>
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-blue-400">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              History ({history.length})
            </button>
            {showHistory && (
              <History
                items={history}
                onSelect={handleLoadHistory}
                onDelete={handleDeleteHistory}
              />
            )}
          </div>

          <div className="flex flex-col overflow-hidden p-6 bg-transparent flex-1">
            <OutputPanel output={output} />
          </div>
        </div>
      </div>
    </main>
  );
}
