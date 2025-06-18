import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Aquí iría la lógica para:
    // 1. Actualizar el estado del pedido a 'aprobado'
    // 2. Reducir el stock de los productos
    // 3. Registrar el movimiento de stock

    console.log(`Aprobando pedido ${id}`)

    // Simulación de actualización de stock
    const stockUpdates = [
      { productoId: 1, cantidadReducida: 20, stockAnterior: 150, stockNuevo: 130 },
      { productoId: 3, cantidadReducida: 15, stockAnterior: 200, stockNuevo: 185 },
    ]

    return NextResponse.json({
      success: true,
      message: "Pedido aprobado exitosamente",
      stockUpdates,
    })
  } catch (error) {
    return NextResponse.json({ error: "Error al aprobar pedido" }, { status: 500 })
  }
}
