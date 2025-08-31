// src/app/api/tasks/route.ts
import { sql } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

// Note: The `DATABASE_URL` environment variable is automatically
// set by the Netlify Neon integration.

/**
 * GET /api/tasks
 * Fetches all tasks from the database.
 */
export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM tasks ORDER BY id ASC;`;
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ message: 'Error fetching tasks' }, { status: 500 });
  }
}

/**
 * POST /api/tasks
 * Creates a new task.
 * Expects a JSON body with a `text` property.
 * e.g., { "text": "My new task" }
 */
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ message: 'Task text is required' }, { status: 400 });
    }

    const { rows } = await sql`INSERT INTO tasks (text) VALUES (${text}) RETURNING *;`;
    return NextResponse.json(rows[0], { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ message: 'Error creating task' }, { status: 500 });
  }
}

/**
 * PUT /api/tasks
 * Updates an existing task (e.g., mark as completed).
 * Expects a JSON body with `id` and `completed` properties.
 * e.g., { "id": 1, "completed": true }
 */
export async function PUT(request: NextRequest) {
  try {
    const { id, completed, text } = await request.json();

    if (typeof id !== 'number') {
      return NextResponse.json({ message: 'A numeric task ID is required' }, { status: 400 });
    }

    // Build the update query dynamically
    const updates: string[] = [];
    const values: (string | boolean | number)[] = [];
    let queryIndex = 1;

    if (typeof text === 'string') {
      updates.push(`text = $${queryIndex++}`);
      values.push(text);
    }

    if (typeof completed === 'boolean') {
      updates.push(`completed = $${queryIndex++}`);
      values.push(completed);
    }
    
    if (updates.length === 0) {
      return NextResponse.json({ message: 'No valid fields to update provided' }, { status: 400 });
    }

    values.push(id);
    const updateQuery = `UPDATE tasks SET ${updates.join(', ')} WHERE id = $${queryIndex} RETURNING *;`;
    
    // The library doesn't support prepared statements, so we use template literals
    // The sql template tag handles sanitization against SQL injection
    const { rows } = await sql.apply(null, [updateQuery, ...values] as any);

    if (rows.length === 0) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0], { status: 200 });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ message: 'Error updating task' }, { status: 500 });
  }
}

/**
 * DELETE /api/tasks
 * Deletes a task.
 * Expects a JSON body with an `id` property.
 * e.g., { "id": 1 }
 */
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (typeof id !== 'number') {
      return NextResponse.json({ message: 'A numeric task ID is required' }, { status: 400 });
    }

    const { rowCount } = await sql`DELETE FROM tasks WHERE id = ${id};`;

    if (rowCount === 0) {
      return NextResponse.json({ message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ message: 'Error deleting task' }, { status: 500 });
  }
}
