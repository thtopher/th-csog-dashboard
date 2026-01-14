import { NextResponse } from 'next/server';
import type { Annotation } from '@/types';

/**
 * GET /api/annotations
 *
 * Retrieves annotations for a target (domain, process, or KPI).
 *
 * Query params:
 * - targetType: 'domain' | 'process' | 'kpi_definition' | 'kpi_value'
 * - targetId: UUID of the target
 * - includeResolved: 'true' | 'false' (default: 'false')
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetType = searchParams.get('targetType');
  const targetId = searchParams.get('targetId');
  const includeResolved = searchParams.get('includeResolved') === 'true';

  if (!targetType || !targetId) {
    return NextResponse.json(
      { error: 'targetType and targetId are required' },
      { status: 400 }
    );
  }

  // TODO: Replace with actual database query
  const annotations: Annotation[] = [];

  return NextResponse.json({ annotations });
}

/**
 * POST /api/annotations
 *
 * Creates a new annotation.
 *
 * Request body:
 * - targetType: 'domain' | 'process' | 'kpi_definition' | 'kpi_value'
 * - targetId: UUID of the target
 * - annotationType: 'comment' | 'trend_note' | 'action_item' | 'context'
 * - title?: string
 * - content: string
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetType, targetId, annotationType, title, content } = body;

    // Validation
    if (!targetType || !targetId || !annotationType || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // TODO: Implement actual database insert
    // 1. Validate user permissions
    // 2. Insert annotation
    // 3. Return created annotation

    const annotation: Annotation = {
      id: crypto.randomUUID(),
      targetType,
      targetId,
      annotationType,
      title,
      content,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(annotation, { status: 201 });
  } catch (error) {
    console.error('Error creating annotation:', error);
    return NextResponse.json(
      { error: 'Failed to create annotation' },
      { status: 500 }
    );
  }
}
