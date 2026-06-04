import { NextResponse } from 'next/server';

export const GENERIC_ERROR = 'Something went wrong';

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonDbError(context: string, error: { message: string }) {
  console.error(`[${context}]`, error.message);
  return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
}
