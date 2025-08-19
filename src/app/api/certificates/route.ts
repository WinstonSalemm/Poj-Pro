import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), "public");
    
    // First try 'cerstificates' directory, then fallback to 'certificates'
    let folder = "cerstificates";
    let dir = path.join(publicDir, folder);
    if (!fs.existsSync(dir)) {
      folder = "certificates";
      dir = path.join(publicDir, folder);
    }

    if (!fs.existsSync(dir)) {
      return NextResponse.json({ items: [], folder });
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const pdfs = entries
      .filter((e) => e.isFile() && e.name.toLowerCase().endsWith(".pdf"))
      .map((e) => e.name)
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));

    const formatTitle = (filename: string): string => {
      // Remove .pdf extension and decode URI components
      let title = filename.replace(/\.pdf$/i, '');
      
      // Replace common patterns with spaces
      title = title
        .replace(/[_-]+/g, ' ')  // Replace underscores and hyphens with spaces
        .replace(/([a-z])([A-Z])/g, '$1 $2')  // Add space before capital letters
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .trim();
      
      // Capitalize first letter of each word
      title = title
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      return title;
    };

    const items = pdfs.map((name, index) => ({
      id: index + 1,
      title: formatTitle(name),
      href: `/${folder}/${encodeURIComponent(name)}`
    }));

    return NextResponse.json({ items, folder });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
