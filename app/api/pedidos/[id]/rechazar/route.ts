// app/api/pedidos/[id]/rechazar/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { gerenteId } = await request.json();

    // Actualizar el estado del pedido a 'rechazado'
    await executeQuery(`
      UPDATE notas_pedido
      SET estado = 'rechazado', 
          fecha_aprobacion = GETDATE(), 
          aprobado_por = ${gerenteId}
      WHERE numero_pedido = '${id}'
    `);

    return NextResponse.json({
      success: true,
      message: "Pedido rechazado exitosamente",
    });
  } catch (error) {
    console.error("Error al rechazar pedido:", error);
    return NextResponse.json({ error: "Error al rechazar pedido" }, { status: 500 });
  }
}