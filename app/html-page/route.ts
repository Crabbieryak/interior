import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    const htmlPath = join(process.cwd(), "public", "test.html");
    const html = readFileSync(htmlPath, "utf-8");
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    return new NextResponse("HTML file not found", { status: 404 });
  }
}
