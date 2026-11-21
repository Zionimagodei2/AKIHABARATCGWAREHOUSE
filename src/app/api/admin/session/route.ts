import { NextResponse, NextRequest } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const session = getAdminSession(req);
  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json({
    id: "admin-local",
    email: session.email,
    name: "Admin",
    role: "admin",
  });
}
