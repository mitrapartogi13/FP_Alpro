// app/components/History.jsx
"use client";

import { Trash2, Copy, Clock } from "lucide-react";

export default function History({ items, onSelect, onDelete }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-4 text-gray-600 text-xs">
        <Clock className="w-4 h-4 mx-auto mb-2 opacity-50" />
        Belum ada history
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="bg-gray-900 border border-gray-800 hover:border-emerald-700 rounded-lg p-3 cursor-pointer transition-colors group"
          onClick={() => onSelect(item)}>
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-300 truncate group-hover:text-emerald-400 transition-colors">
                {item.title}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {new Date(item.timestamp).toLocaleString("id-ID")}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="flex-shrink-0 text-gray-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100 p-1 -mr-1"
              title="Hapus">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">
            {item.preview}
          </p>
        </div>
      ))}
    </div>
  );
}
