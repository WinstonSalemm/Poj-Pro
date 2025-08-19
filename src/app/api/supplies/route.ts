import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const SUPPLIES_FILE = path.join(process.cwd(), 'data', 'supplies.json');

// Helper function to read supplies from file
async function readSupplies() {
  try {
    const data = await fs.readFile(SUPPLIES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty array
    if (error.code === 'ENOENT') {
      await fs.writeFile(SUPPLIES_FILE, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    throw error;
  }
}

// Helper function to write supplies to file
async function writeSupplies(supplies) {
  const tempFile = `${SUPPLIES_FILE}.tmp`;
  await fs.writeFile(tempFile, JSON.stringify(supplies, null, 2), 'utf-8');
  await fs.rename(tempFile, SUPPLIES_FILE);
}

// GET /api/supplies
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    
    let supplies = await readSupplies();
    
    // Filter supplies if search query is provided
    if (search) {
      supplies = supplies.filter(supply => 
        supply.items.some(item => 
          item.name.toLowerCase().includes(search) || 
          (item.supplier && item.supplier.toLowerCase().includes(search))
        )
      );
    }
    
    return NextResponse.json(supplies);
  } catch (error) {
    console.error('Error reading supplies:', error);
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
    
    const newSupply = await request.json();
    
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
    for (const item of newSupply.items) {
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
    console.error('Error creating supply:', error);
    return NextResponse.json(
      { error: 'Failed to create supply' },
      { status: 500 }
    );
  }
}
