import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import path from "path";
import { existsSync } from "fs";

// DELETE /api/certificates/[id] — Delete a specific certificate image by ID
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Find the certificate first to get the file path
    const certificate = await db.certificateImage.findUnique({
      where: { id },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Certificate not found" },
        { status: 404 }
      );
    }

    // Delete the file from the filesystem
    const filePath = path.join(process.cwd(), "public", certificate.url);
    if (existsSync(filePath)) {
      const { unlink } = await import("fs/promises");
      await unlink(filePath);
    }

    // Delete from database
    await db.certificateImage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting certificate:", error);
    return NextResponse.json(
      { error: "Failed to delete certificate" },
      { status: 500 }
    );
  }
}
