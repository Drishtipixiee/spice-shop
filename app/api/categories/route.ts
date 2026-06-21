import { NextResponse } from 'next/server';
import data from '../../../lib/data.json';

export async function GET() {
  return NextResponse.json(data.categories);
}
