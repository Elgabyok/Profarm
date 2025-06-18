// app/api/test-db/route.ts
import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    const result = await executeQuery("SELECT TOP 5 * FROM usuarios")
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error("Error de conexión:", error)
    return NextResponse.json({ error: "Error de conexión a la base de datos" }, { status: 500 })
  }
}