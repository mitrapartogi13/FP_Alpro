// app/page.js
"use client";

import { useState, useRef } from "react";
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
  const [output, setOutput] = useState(
    `## Judul Catatan\n\n  Ini adalah **contoh hasil** dari AI.\n\n  ### Poin Penting\n  - Item pertama yang penting\n  - Item kedua dengan \`kode inline\`\n\n  > Ini adalah blockquote kutipan penting\n\n  ### ✅ To-Do List\n  - [ ] Task pertama\n  - [ ] Task kedua\n  `,
  );

  // pdf state
  const [inputTab, setInputTab] = useState("text");
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfStatus, setPdfStatus] = useState("");
  const [pdfMeta, setPdfMeta] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // pdf handling
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

      // cek response
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

  // generate logic
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
      setOutput(data.markdown || "");
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat generate note");
    } finally {
      setIsLoading(false);
    }
  };

  const canGenerate = rawText.trim() && !isLoading;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-[#0f172a] to-black text-gray-100 flex flex-col font-sans selection:bg-blue-500/30">
      {/* header glassmorphism */}
      <header className="bg-white/5 backdrop-blur-md border-b border-white/10 px-8 py-5 shadow-lg z-10">
        <h1 className="text-2xl font-black tracking-tight bg-gradient-to-br from-white via-blue-200 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(59,130,246,0.4)]">
          Markdown Generator
        </h1>
        <p className="text-sm text-gray-400 mt-1 font-medium">
          Smart Markdown Note Generator
        </p>
      </header>

      {/* main content dengan padding dan gap */}
      <div className="flex flex-1 overflow-hidden p-6 gap-6 max-w-[1600px] w-full mx-auto">
        {/* panel kiri */}
        <div className="w-1/2 flex flex-col gap-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-7 shadow-2xl shadow-blue-900/10 transition-all hover:shadow-blue-900/20">
          {/* input tabs */}
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex items-center gap-1 bg-black/30 rounded-xl p-1 w-fit border border-white/5">
              <button
                onClick={() => {
                  setInputTab("text");
                  setError("");
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300
                  ${inputTab === "text" ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"}`}>
                📋 Tempel Teks
              </button>
              <button
                onClick={() => {
                  setInputTab("pdf");
                  setError("");
                }}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300
                  ${inputTab === "pdf" ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"}`}>
                📄 Upload PDF
              </button>
            </div>

            {/* tab teks */}
            {inputTab === "text" && (
              <div className="flex flex-col gap-2 flex-1 animate-in fade-in zoom-in-95 duration-300">
                <label className="text-sm font-semibold text-gray-300 ml-1">
                  Teks Mentahmu
                </label>
                <textarea
                  className="flex-1 bg-black/20 border border-white/10 rounded-2xl p-4 text-sm text-gray-200
                             placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                             focus:border-blue-500/50 transition-all shadow-inner backdrop-blur-sm"
                  placeholder="Tempel catatan berantakan, transkrip rapat, atau draft apapun di sini..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                />
              </div>
            )}

            {/* tab pdf */}
            {inputTab === "pdf" && (
              <div className="flex flex-col gap-3 flex-1 animate-in fade-in zoom-in-95 duration-300">
                <label className="text-sm font-semibold text-gray-300 ml-1">
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
                    className={`flex-1 min-h-[200px] flex flex-col items-center justify-center gap-4
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
                        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin shadow-lg shadow-blue-500/20" />
                        <p className="text-sm font-medium text-blue-300 animate-pulse">
                          Membaca PDF...
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="text-4xl drop-shadow-md">📄</div>
                        <div className="text-center">
                          <p className="text-sm text-gray-200 font-semibold">
                            {isDragOver
                              ? "Lepas file di sini"
                              : "Klik atau seret file PDF"}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Maksimal 10 MB
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {pdfStatus === "done" && pdfFile && (
                  <div className="flex flex-col gap-4 flex-1 animate-in fade-in duration-300">
                    <div className="flex items-start justify-between bg-blue-500/10 border border-blue-500/20 backdrop-blur-md rounded-2xl p-4 shadow-inner">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl drop-shadow-md">📄</span>
                        <div>
                          <p className="text-sm font-semibold text-blue-300 truncate max-w-xs">
                            {pdfFile.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {pdfMeta?.pages} halaman
                            {pdfMeta?.title ? ` · ${pdfMeta.title}` : ""}
                            {" · "}
                            {(pdfFile.size / 1024).toFixed(0)} KB
                          </p>
                          <p className="text-xs font-medium text-blue-400 mt-1.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                            {rawText.length.toLocaleString()} karakter
                            terekstrak
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={clearPdf}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-black/20 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-lg"
                        title="Hapus PDF">
                        ×
                      </button>
                    </div>

                    <div className="flex flex-col gap-2 flex-1">
                      <label className="text-xs font-medium text-gray-500 ml-1">
                        Teks hasil ekstrak · bisa diedit
                      </label>
                      <textarea
                        className="flex-1 bg-black/20 border border-white/10 rounded-2xl p-4 text-xs text-gray-300
                                   font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 
                                   focus:border-blue-500/50 transition-all shadow-inner backdrop-blur-sm min-h-[150px]"
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
          <div className="flex flex-col gap-3 bg-white/5 border border-white/5 rounded-2xl p-4">
            <label className="text-sm font-semibold text-gray-200 flex items-center gap-2">
              <span className="text-blue-400">⚡</span> Opsi Tambahan
            </label>
            <div className="flex flex-col gap-3">
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
                  className="flex items-center gap-3 cursor-pointer group w-fit">
                  <div
                    onClick={() => handleToggle(key)}
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 shadow-sm
                      ${toggles[key] ? "bg-blue-500 border-blue-500 shadow-blue-500/30" : "bg-black/20 border-white/20 group-hover:border-blue-400 group-hover:bg-blue-500/10"}`}>
                    {toggles[key] && (
                      <svg
                        className="w-3.5 h-3.5 text-white animate-in zoom-in duration-200"
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
                    className={`text-sm transition-colors duration-300 ${toggles[key] ? "text-blue-100 font-medium" : "text-gray-400 group-hover:text-gray-200"}`}>
                    {label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* custom prompt */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-200 ml-1 flex items-center gap-2">
              <span className="text-indigo-400">🎯</span> Instruksi Khusus{" "}
              <span className="text-gray-500 font-normal text-xs">
                (opsional)
              </span>
            </label>
            <input
              type="text"
              className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-200
                         placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 
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
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2
              ${
                !canGenerate
                  ? "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"
                  : "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5 border border-blue-500/50"
              }`}>
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>AI is thinking...</span>
              </>
            ) : (
              "✦ Generate Note"
            )}
          </button>

          {error && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 backdrop-blur-sm rounded-xl p-3 flex items-center gap-2 shadow-inner">
                <span className="text-base">⚠️</span> {error}
              </p>
            </div>
          )}
        </div>

        {/* panel kanan */}
        <div className="w-1/2 flex flex-col overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl shadow-black/50">
          <OutputPanel output={output} />
        </div>
      </div>
    </main>
  );
}
