import { NextResponse } from 'next/server';

export function apiError(
  context: string,
  error: unknown,
  status = 500,
): NextResponse {
  console.error(`[${context}]`, error);
  return NextResponse.json(
    { error: 'Something went wrong. Please try again.' },
    { status },
  );
}

export function validationError(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}
