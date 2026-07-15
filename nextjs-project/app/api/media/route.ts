import { type NextRequest, NextResponse } from "next/server"
import { getEnv } from "@/lib/env"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")
  if (!url) {
    return NextResponse.json({ message: "Missing url param" }, { status: 400 })
  }

  const env = getEnv()
  const strapiUrl = env.STRAPI_URL.replace(/\/$/, "")

  try {
    const res = await fetch(`${strapiUrl}${url}`)
    if (!res.ok) {
      return NextResponse.json({ message: "Media not found" }, { status: res.status })
    }

    const body = await res.arrayBuffer()
    const contentType = res.headers.get("content-type") ?? "application/octet-stream"

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return NextResponse.json({ message: "Failed to fetch media" }, { status: 502 })
  }
}
