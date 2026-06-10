import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'offers.json');

function getData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

export async function PUT(request, { params }) {
  const { id } = await params;
  const body = await request.json();
  const items = getData();
  const index = items.findIndex(e => e.id === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  items[index] = { ...items[index], ...body };
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
  return NextResponse.json(items[index]);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const items = getData();
  const filtered = items.filter(e => e.id !== id);
  if (filtered.length === items.length) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2));
  return NextResponse.json({ success: true });
}
