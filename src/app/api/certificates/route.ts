import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

// GET /api/certificates — Return all certificate images ordered by `order`
export async function GET() {
  try {
    const certificates = await db.certificateImage.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}

// POST /api/certificates — Upload a new certificate image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const alt = (formData.get("alt") as string) || "Business Certificate";
    const order = parseInt(formData.get("order") as string) || 0;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Ensure the certificates directory exists
    const certificatesDir = path.join(process.cwd(), "public", "certificates");
    if (!existsSync(certificatesDir)) {
      await mkdir(certificatesDir, { recursive: true });
    }

    // Generate unique filename
    const ext = path.extname(file.name) || ".jpg";
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;
    const filePath = path.join(certificatesDir, uniqueName);

    // Write the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Store the URL path in the database
    const urlPath = `/certificates/${uniqueName}`;
    const certificate = await db.certificateImage.create({
      data: {
        url: urlPath,
        alt,
        order,
      },
    });

    return NextResponse.json(certificate, { status: 201 });
  } catch (error) {
    console.error("Error uploading certificate:", error);
    return NextResponse.json(
      { error: "Failed to upload certificate" },
      { status: 500 }
    );
  }
}

// DELETE /api/certificates — Delete a certificate image by ID (in body)
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Certificate ID is required" },
        { status: 400 }
      );
    }

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
