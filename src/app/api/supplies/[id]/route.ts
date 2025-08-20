import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SUPPLIES_FILE = path.join(process.cwd(), 'data', 'supplies.json');

type SupplyItem = {
  name: string;
  quantity: number;
};

type Supply = {
  id: string;
  title: string;
  etaDate: string;
  status: string;
  items: SupplyItem[];
  createdAt?: string;
  updatedAt?: string;
};

// Helper function to read supplies from file
async function readSupplies(): Promise<Supply[]> {
  try {
    const data = await fs.readFile(SUPPLIES_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? (parsed as Supply[]) : [];
  } catch (error: unknown) {
    // If file doesn't exist, return empty array
    const code = typeof error === 'object' && error !== null && 'code' in error ? (error as { code?: unknown }).code : undefined;
    if (code === 'ENOENT') {
      await fs.writeFile(SUPPLIES_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    throw error;
  }
}

// Helper function to write supplies to file
async function writeSupplies(supplies: Supply[]): Promise<void> {
  const tempFile = `${SUPPLIES_FILE}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(supplies, null, 2), 'utf-8');
  await fs.rename(tempFile, SUPPLIES_FILE);
}

// PUT /api/supplies/[id]
export async function PUT(
  request: NextRequest
) {
  try {
    // Verify admin token
    const token = request.headers.get('x-admin-token');
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin-ship-2025';
    
    if (token !== adminPassword) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const updatedSupply = await request.json();
    const { pathname } = new URL(request.url);
    const segments = pathname.split('/');
    const supplyId = segments[segments.indexOf('supplies') + 1] || '';
    
    // Validate required fields
    if (!updatedSupply.title || !updatedSupply.etaDate || !updatedSupply.status) {
      return NextResponse.json(
        { error: 'Title, ETA date, and status are required' },
        { status: 400 }
      );
    }
    
    // Validate items array
    if (!Array.isArray(updatedSupply.items) || updatedSupply.items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }
    
    // Validate items
    for (const item of updatedSupply.items) {
      if (!item.name || item.quantity === undefined || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Each item must have a name and a positive quantity' },
          { status: 400 }
        );
      }
    }
    
    const supplies = await readSupplies();
    const index = supplies.findIndex(s => s.id === supplyId);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Supply not found' },
        { status: 404 }
      );
    }
    
    const now = new Date().toISOString();
    const updated = {
      ...updatedSupply,
      id: supplyId,
      updatedAt: now,
      // Preserve created date
      createdAt: supplies[index].createdAt,
    };
    
    supplies[index] = updated;
    await writeSupplies(supplies);
    
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('[api/supplies/[id]][PUT] error', error);
    return NextResponse.json(
      { error: 'Failed to update supply' },
      { status: 500 }
    );
  }
}

// DELETE /api/supplies/[id]
export async function DELETE(
  request: NextRequest
) {
  try {
    // Verify admin token
    const token = request.headers.get('x-admin-token');
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin-ship-2025';
    
    if (token !== adminPassword) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { pathname } = new URL(request.url);
    const segments = pathname.split('/');
    const supplyId = segments[segments.indexOf('supplies') + 1] || '';
    const supplies = await readSupplies();
    const index = supplies.findIndex((s) => s.id === supplyId);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Supply not found' },
        { status: 404 }
      );
    }
    
    supplies.splice(index, 1);
    await writeSupplies(supplies);
    
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('[api/supplies/[id]][DELETE] error', error);
    return NextResponse.json(
      { error: 'Failed to delete supply' },
      { status: 500 }
    );
  }
}
