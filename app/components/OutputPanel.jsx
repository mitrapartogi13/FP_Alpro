// app/components/OutputPanel.jsx
"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"

export default function OutputPanel({ output }) {
  const [activeTab, setActiveTab] = useState("preview")
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Tampilan saat output kosong
  if (!output) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
        <div className="text-4xl">📝</div>
        <p className="text-gray-600 text-sm">
          Hasilmu akan muncul di sini setelah kamu klik <strong className="text-gray-500">Generate Note</strong>
        </p>
      </div>
    )
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
                ${activeTab === tab
                  ? "bg-gray-700 text-gray-100"
                  : "text-gray-500 hover:text-gray-300"
                }`}
            >
              {tab === "preview" ? "👁 Preview" : "< > Raw"}
            </button>
          ))}
        </div>

        <button
          onClick={handleCopy}
          className={`text-xs px-3 py-1.5 rounded-lg border transition-all
            ${copied
              ? "border-emerald-500 text-emerald-400"
              : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
            }`}
        >
          {copied ? "✓ Tersalin!" : "Copy Markdown"}
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-gray-900 rounded-lg border border-gray-800 p-4 overflow-y-auto">

        {activeTab === "preview" ? (
          // Rendered Markdown
          <div className="prose prose-invert prose-sm max-w-none
                          prose-headings:text-emerald-400
                          prose-strong:text-gray-200
                          prose-blockquote:border-emerald-500 prose-blockquote:text-gray-400
                          prose-code:text-emerald-300 prose-code:bg-gray-800 prose-code:px-1 prose-code:rounded
                          prose-li:text-gray-300">
            <ReactMarkdown>{output}</ReactMarkdown>
          </div>
        ) : (
          // Raw Markdown text
          <pre className="text-xs text-gray-400 whitespace-pre-wrap font-mono leading-relaxed">
            {output}
          </pre>
        )}

      </div>
    </div>
  )
}