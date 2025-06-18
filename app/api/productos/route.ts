// app/api/productos/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const busqueda = searchParams.get("busqueda");

    let query = `
      SELECT 
        id, 
        nombre, 
        marca, 
        unidad_venta as unidad, 
        precio, 
        stock_actual as stock, 
        lote, 
        CONVERT(VARCHAR, fecha_vencimiento, 23) as vencimiento
      FROM productos 
      WHERE activo = 1
    `;
    
    if (busqueda) {
      query += ` AND (nombre LIKE '%${busqueda}%' OR marca LIKE '%${busqueda}%')`;
    }

    const productos = await executeQuery(query);
    
    return NextResponse.json({
      success: true,
      productos,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 });
  }
}