// app/components/OutputPanel.jsx
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

// kustomisasi markdown
const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-extrabold text-blue-400 mt-6 mb-4 border-b border-white/10 pb-2 drop-shadow-sm">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-blue-300 mt-5 mb-3">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-indigo-300 mt-4 mb-2">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-gray-300 text-sm leading-relaxed mb-4">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1.5 mb-4 ml-2 marker:text-blue-500">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside text-gray-300 text-sm space-y-1.5 mb-4 ml-2 marker:text-blue-500 font-medium">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="text-gray-300 text-sm">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-500/5 rounded-r-xl italic text-gray-300 text-sm shadow-inner backdrop-blur-sm">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = Boolean(className);

    return isBlock ? (
      <code className="text-blue-200 text-xs font-mono">{children}</code>
    ) : (
      <code className="bg-black/30 text-blue-300 px-1.5 py-0.5 rounded-md text-xs font-mono border border-white/5">
        {children}
      </code>
    );
  },
  strong: ({ children }) => (
    <strong className="text-gray-100 font-bold drop-shadow-sm">
      {children}
    </strong>
  ),
  hr: () => <hr className="border-white/10 my-6" />,

  pre: ({ children }) => (
    <pre className="bg-black/40 border border-white/5 rounded-xl p-4 my-4 overflow-x-auto shadow-inner backdrop-blur-sm">
      {children}
    </pre>
  ),
};

export default function OutputPanel({ output }) {
  const [activeTab, setActiveTab] = useState("preview");
  const [copied, setCopied] = useState(false);

  // copy logic
  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!output) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 animate-in fade-in zoom-in-95 duration-500">
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center shadow-inner border border-white/10">
          <span className="text-3xl">✨</span>
        </div>
        <div>
          <p className="text-gray-300 font-medium">Belum ada hasil</p>
          <p className="text-gray-500 text-sm mt-1">
            Hasil generasimu akan muncul di sini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full animate-in fade-in duration-500">
      {/* tab bar & copy btn */}
      <div className="flex items-center justify-between bg-black/20 p-1.5 rounded-2xl border border-white/5 backdrop-blur-sm">
        <div className="flex gap-1">
          {["preview", "raw"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 capitalize
                ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                }`}>
              {tab === "preview" ? (
                <span className="flex items-center gap-1.5">
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Preview
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <svg
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-4 h-4">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
                    />
                  </svg>
                  Raw
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className={`text-xs px-4 py-2 rounded-xl font-bold transition-all duration-300 flex items-center gap-1.5 mr-1
            ${
              copied
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10 hover:border-white/20"
            }`}>
          {copied ? "✓ Tersalin!" : "📋 Copy"}
        </button>
      </div>

      {/* content area */}
      <div className="flex-1 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 p-6 overflow-y-auto shadow-inner custom-scrollbar">
        {activeTab === "preview" ? (
          <div className="animate-in fade-in duration-300">
            <ReactMarkdown components={markdownComponents}>
              {output}
            </ReactMarkdown>
          </div>
        ) : (
          <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono leading-relaxed animate-in fade-in duration-300">
            {output}
          </pre>
        )}
      </div>
    </div>
  );
}
