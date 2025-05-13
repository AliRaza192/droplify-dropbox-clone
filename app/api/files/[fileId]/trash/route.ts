import { db } from "@/lib/db";
import { files } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Move file to trash
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ fileId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await props.params;
    if (!fileId) {
      return NextResponse.json(
        { error: "File id is required!" },
        { status: 400 }
      );
    }

    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));

    if (!file) {
      return NextResponse.json({ error: "File not found!" }, { status: 404 });
    }

    // Move file to trash by updating isTrash flag
    const updatedFiles = await db
      .update(files)
      .set({ isTrash: true })
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning();

    const updatedFile = updatedFiles[0];
    return NextResponse.json(updatedFile);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to move file to trash." },
      { status: 500 }
    );
  }
}

// Restore file from trash
export async function POST(
  request: NextRequest,
  props: { params: Promise<{ fileId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await props.params;
    if (!fileId) {
      return NextResponse.json(
        { error: "File id is required!" },
        { status: 400 }
      );
    }

    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.id, fileId), eq(files.userId, userId)));

    if (!file) {
      return NextResponse.json({ error: "File not found!" }, { status: 404 });
    }

    // Restore file from trash
    const restoredFiles = await db
      .update(files)
      .set({ isTrash: false })
      .where(and(eq(files.id, fileId), eq(files.userId, userId)))
      .returning();

    const restoredFile = restoredFiles[0];
    return NextResponse.json(restoredFile);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to restore the file." },
      { status: 500 }
    );
  }
}