// app/components/OutputPanel.jsx
"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

const markdownComponents = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-emerald-400 mt-6 mb-3 border-b border-gray-700 pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-bold text-emerald-400 mt-5 mb-2">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-base font-semibold text-emerald-300 mt-4 mb-1">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="text-gray-300 text-sm leading-relaxed mb-3">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc list-inside text-gray-300 text-sm space-y-1 mb-3 ml-2">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal list-inside text-gray-300 text-sm space-y-1 mb-3 ml-2">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="text-gray-300 text-sm">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-emerald-500 pl-4 py-1 my-3 bg-gray-800 rounded-r-lg italic text-gray-400 text-sm">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = Boolean(className); 

    return isBlock ? (
      <code className="text-emerald-300 text-xs font-mono">{children}</code>
    ) : (
      <code className="bg-gray-800 text-emerald-300 px-1.5 py-0.5 rounded text-xs font-mono">
        {children}
      </code>
    );
  },
  strong: ({ children }) => (
    <strong className="text-gray-100 font-semibold">{children}</strong>
  ),
  hr: () => <hr className="border-gray-700 my-4" />,

  pre: ({ children }) => (
    <pre className="bg-gray-800 rounded-lg p-3 my-3 overflow-x-auto">
      {children}
    </pre>
  ),
};

export default function OutputPanel({ output }) {
  const [activeTab, setActiveTab] = useState("preview");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!output) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
        <div className="text-4xl">📝</div>
        <p className="text-gray-600 text-sm">
          Hasilmu akan muncul di sini setelah kamu klik{" "}
          <strong className="text-gray-500">Generate Note</strong>
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Tab Bar + Copy Button */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-900 rounded-lg p-1">
          {["preview", "raw"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize
                ${
                  activeTab === tab
                    ? "bg-gray-700 text-gray-100"
                    : "text-gray-500 hover:text-gray-300"
                }`}>
              {tab === "preview" ? "👁 Preview" : "< > Raw"}
            </button>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-all
            ${
              copied
                ? "border-emerald-500 text-emerald-400"
                : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
            }`}>
          {copied ? "✓ Tersalin!" : "Copy Markdown"}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-gray-900 rounded-lg border border-gray-800 p-4 overflow-y-auto">
        {activeTab === "preview" ? (
          <ReactMarkdown components={markdownComponents}>
            {output}
          </ReactMarkdown>
        ) : (
          <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono leading-relaxed">
            {output}
          </pre>
        )}
      </div>
    </div>
  );
}
