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

  // PDF state
  const [inputTab, setInputTab] = useState("text"); // "text" | "pdf"
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfStatus, setPdfStatus] = useState(""); // "", "loading", "done", "error"
  const [pdfMeta, setPdfMeta] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleToggle = (key) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // PDF handling
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

  // Generate
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
        {/* PANEL KIRI */}
        <div className="w-1/2 border-r border-gray-800 p-6 flex flex-col gap-5">
          {/* INPUT TABS */}
          <div className="flex flex-col gap-3 flex-1">
            <div className="flex items-center gap-1 bg-gray-900 rounded-lg p-1 w-fit">
              <button
                onClick={() => {
                  setInputTab("text");
                  setError("");
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${inputTab === "text" ? "bg-gray-700 text-gray-100" : "text-gray-500 hover:text-gray-300"}`}>
                📋 Tempel Teks
              </button>
              <button
                onClick={() => {
                  setInputTab("pdf");
                  setError("");
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                  ${inputTab === "pdf" ? "bg-gray-700 text-gray-100" : "text-gray-500 hover:text-gray-300"}`}>
                📄 Upload PDF
              </button>
            </div>

            {/* TAB: TEKS */}
            {inputTab === "text" && (
              <div className="flex flex-col gap-2 flex-1">
                <label className="text-sm font-semibold text-gray-300">
                  Teks Mentahmu
                </label>
                <textarea
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-sm text-gray-200
                             placeholder-gray-600 resize-none focus:outline-none focus:border-emerald-500
                             transition-colors min-h-48"
                  placeholder="Tempel catatan berantakan, transkrip rapat, atau draft apapun di sini..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                />
              </div>
            )}

            {/* TAB: PDF */}
            {inputTab === "pdf" && (
              <div className="flex flex-col gap-3 flex-1">
                <label className="text-sm font-semibold text-gray-300">
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
                                border-2 border-dashed rounded-xl cursor-pointer transition-all
                                ${isDragOver ? "border-emerald-400 bg-emerald-950/20" : "border-gray-700 hover:border-gray-500 hover:bg-gray-900/50"}
                                ${pdfStatus === "loading" ? "pointer-events-none opacity-60" : ""}`}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      className="hidden"
                      onChange={handleFileInput}
                    />
                    {pdfStatus === "loading" ? (
                      <>
                        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-sm text-gray-400">Membaca PDF...</p>
                      </>
                    ) : (
                      <>
                        <div className="text-3xl">📄</div>
                        <div className="text-center">
                          <p className="text-sm text-gray-300 font-medium">
                            {isDragOver
                              ? "Lepas file di sini"
                              : "Klik atau seret file PDF"}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Maksimal 10 MB
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {pdfStatus === "done" && pdfFile && (
                  <div className="flex flex-col gap-3 flex-1">
                    <div className="flex items-start justify-between bg-emerald-950/30 border border-emerald-800/50 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <span className="text-lg mt-0.5">📄</span>
                        <div>
                          <p className="text-sm font-medium text-emerald-300 truncate max-w-xs">
                            {pdfFile.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {pdfMeta?.pages} halaman
                            {pdfMeta?.title ? ` · ${pdfMeta.title}` : ""}
                            {" · "}
                            {(pdfFile.size / 1024).toFixed(0)} KB
                          </p>
                          <p className="text-xs text-emerald-600 mt-1">
                            ✓ {rawText.length.toLocaleString()} karakter
                            berhasil diekstrak
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={clearPdf}
                        className="text-gray-600 hover:text-rose-400 transition-colors text-xl leading-none ml-2"
                        title="Hapus PDF">
                        ×
                      </button>
                    </div>

                    <div className="flex flex-col gap-1 flex-1">
                      <label className="text-xs text-gray-500">
                        Teks hasil ekstrak · bisa diedit sebelum generate
                      </label>
                      <textarea
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs text-gray-400
                                   font-mono resize-none focus:outline-none focus:border-emerald-500
                                   transition-colors min-h-36"
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Smart Toggles */}
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
                  className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => handleToggle(key)}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors
                      ${toggles[key] ? "bg-emerald-500 border-emerald-500" : "border-gray-600 group-hover:border-emerald-500"}`}>
                    {toggles[key] && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor">
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

          {/* Custom Prompt */}
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

          {/* Generate Button */}
          <button
            disabled={!canGenerate}
            onClick={handleGenerate}
            className={`w-full py-3 rounded-lg font-semibold text-sm transition-all
              ${
                !canGenerate
                  ? "bg-gray-800 text-gray-600 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-400 text-gray-950 cursor-pointer"
              }`}>
            {isLoading ? "✦ AI is thinking..." : "✦ Generate Note"}
          </button>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900 rounded-lg p-2">
              {error}
            </p>
          )}
        </div>

        {/* PANEL KANAN */}
        <div className="w-1/2 flex flex-col overflow-hidden p-6">
          <OutputPanel output={output} />
        </div>
      </div>
    </main>
  );
}
