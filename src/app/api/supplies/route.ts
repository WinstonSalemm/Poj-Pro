import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SUPPLIES_FILE = path.join(process.cwd(), 'data', 'supplies.json');

type SupplyItem = {
  name: string;
  quantity: number;
  supplier?: string;
};

type Supply = {
  id: string;
  title: string;
  etaDate: string;
  status: string;
  items: SupplyItem[];
  createdAt: string;
  updatedAt: string;
};

// Helper function to read supplies from file
async function readSupplies(): Promise<Supply[]> {
  try {
    const data = await fs.readFile(SUPPLIES_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? (parsed as Supply[]) : [];
  } catch (error) {
    // If file doesn't exist, return empty array
    if (error && typeof error === 'object' && 'code' in error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
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

// GET /api/supplies
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    
    let supplies: Supply[] = await readSupplies();
    
    // Filter supplies if search query is provided
    if (search) {
      supplies = supplies.filter((supply: Supply) =>
        supply.items.some((item: SupplyItem) =>
          item.name.toLowerCase().includes(search) ||
          (!!item.supplier && item.supplier.toLowerCase().includes(search))
        )
      );
    }
    
    return NextResponse.json(supplies, { status: 200 });
  } catch (error) {
    console.error('[api/supplies][GET] error', error);
    return NextResponse.json(
      { error: 'Failed to fetch supplies' },
      { status: 500 }
    );
  }
}

// POST /api/supplies
export async function POST(request: Request) {
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
    
    const newSupply = (await request.json()) as Partial<Supply> & { items?: Partial<SupplyItem>[] };
    
    // Validate required fields
    if (!newSupply.title || !newSupply.etaDate || !newSupply.status) {
      return NextResponse.json(
        { error: 'Title, ETA date, and status are required' },
        { status: 400 }
      );
    }
    
    // Validate items array
    if (!Array.isArray(newSupply.items) || newSupply.items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      );
    }
    
    // Validate items
    for (const item of newSupply.items as SupplyItem[]) {
      if (!item.name || item.quantity === undefined || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Each item must have a name and a positive quantity' },
          { status: 400 }
        );
      }
    }
    
    const supplies = await readSupplies();
    const now = new Date().toISOString();
    
    const supply = {
      id: crypto.randomUUID(),
      title: newSupply.title,
      etaDate: newSupply.etaDate,
      status: newSupply.status,
      items: newSupply.items,
      createdAt: now,
      updatedAt: now,
    };
    
    supplies.push(supply);
    await writeSupplies(supplies);
    
    return NextResponse.json(supply, { status: 201 });
  } catch (error) {
    console.error('[api/supplies][POST] error', error);
    return NextResponse.json(
      { error: 'Failed to create supply' },
      { status: 500 }
    );
  }
}
