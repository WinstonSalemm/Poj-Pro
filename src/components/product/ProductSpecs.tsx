"use client";
import React from "react";

export default function ProductSpecs({ specs, className }: { specs: [string, string][], className?: string }) {
  if (!specs || specs.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <table className="w-full text-sm text-left text-gray-600">
        <tbody>
          {specs.map(([key, value]) => (
            <tr key={key} className="border-b border-gray-200 hover:bg-gray-50">
              <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                {key}
              </th>
              <td className="px-4 py-3">
                {value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
