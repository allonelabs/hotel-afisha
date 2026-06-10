import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'team.json');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function getData() {
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET() {
  return NextResponse.json(getData(), { headers: corsHeaders });
}

export async function POST(request) {
  const body = await request.json();
  if (!body.name || !body.role) {
    return NextResponse.json({ error: 'Name and role are required' }, { status: 400 });
  }

  const items = getData();
  const newItem = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    name: body.name,
    role: body.role,
    bio: body.bio || '',
    img: body.img || '',
    order: body.order || items.length,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
  return NextResponse.json(newItem, { status: 201 });
}
