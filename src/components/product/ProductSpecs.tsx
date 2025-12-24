"use client";
import React from "react";

export default function ProductSpecs({ specs, className }: { specs: [string, string][], className?: string }) {
  if (!specs || specs.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {/* Desktop table view */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-xs sm:text-sm text-left text-gray-600">
          <tbody>
            {specs.map(([key, value]) => (
              <tr key={key} className="border-b border-gray-200 hover:bg-gray-50">
                <th scope="row" className="px-2 sm:px-4 py-2 sm:py-3 font-medium text-gray-900 min-w-[120px] sm:min-w-0">
                  {key}
                </th>
                <td className="px-2 sm:px-4 py-2 sm:py-3 break-words">
                  {value}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile vertical stack view */}
      <div className="sm:hidden space-y-3">
        {specs.map(([key, value]) => (
          <div key={key} className="border-b border-gray-200 pb-3 last:border-0">
            <div className="text-xs font-medium text-gray-900 mb-1">{key}</div>
            <div className="text-xs text-gray-600 break-words">{value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
