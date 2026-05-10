// app/components/History.jsx
"use client";

export default function History({ items, onSelect, onDelete }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-6 text-slate-500 text-xs">
        <svg
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6 mx-auto mb-2 opacity-30"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Belum ada history
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="bg-black/30 border border-white/10 hover:border-blue-500/50 rounded-lg p-3 cursor-pointer transition-all duration-300 group hover:bg-blue-500/5"
          onClick={() => onSelect(item)}
        >
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate group-hover:text-blue-300 transition-colors">
                {item.title}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(item.timestamp).toLocaleString("id-ID")}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="shrink-0 text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-1 -mr-1 hover:bg-red-500/10 rounded-md"
              title="Hapus"
            >
              <svg
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
          <p className="text-xs text-slate-400 line-clamp-2">
            {item.preview}
          </p>
        </div>
      ))}
    </div>
  );
}
