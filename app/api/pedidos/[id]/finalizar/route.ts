import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { usuarioId } = await request.json()

    console.log(`Finalizando pedido ${id} por usuario ${usuarioId}`)

    // Verificar que el pedido existe y está aprobado
    const pedidoResult = await executeQuery(`
      SELECT id, estado, numero_pedido 
      FROM notas_pedido 
      WHERE numero_pedido = '${id}'
    `)

    if (!pedidoResult || pedidoResult.length === 0) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    const pedido = pedidoResult[0]

    if (pedido.estado !== "aprobado") {
      return NextResponse.json(
        {
          error: `No se puede finalizar un pedido en estado "${pedido.estado}". Solo se pueden finalizar pedidos aprobados.`,
        },
        { status: 400 },
      )
    }

    // Actualizar el estado del pedido a finalizado usando GETDATE() para SQL Server
    const updateQuery = `
      UPDATE notas_pedido 
      SET 
        estado = 'finalizado',
        fecha_finalizacion = GETDATE(),
        finalizado_por = ${usuarioId}
      WHERE numero_pedido = '${id}'
    `

    console.log("Ejecutando query:", updateQuery)

    await executeQuery(updateQuery)

    console.log(`Pedido ${id} finalizado exitosamente`)

    return NextResponse.json({
      success: true,
      message: "Pedido finalizado exitosamente",
      pedido: {
        id: pedido.numero_pedido,
        estado: "finalizado",
        fecha_finalizacion: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error("Error de base de datos:", error)
    console.error("Error al finalizar pedido:", error)
    return NextResponse.json(
      { error: "Error interno al finalizar pedido: " + (error as Error).message },
      { status: 500 },
    )
  }
}
