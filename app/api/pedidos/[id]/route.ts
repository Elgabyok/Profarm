import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log("Obteniendo detalle del pedido:", id)

    // Obtener datos principales del pedido
    const pedidoQuery = `
      SELECT 
        np.id,
        np.numero_pedido,
        np.fecha_pedido,
        np.forma_pago,
        np.observaciones,
        np.estado,
        np.total,
        np.fecha_aprobacion,
        np.fecha_finalizacion,
        u.nombre as vendedor,
        c.razon_social,
        c.cuit,
        c.telefono,
        c.direccion,
        c.email
      FROM notas_pedido np
      JOIN usuarios u ON np.vendedor_id = u.id
      JOIN clientes c ON np.cliente_id = c.id
      WHERE np.numero_pedido = '${id}'
    `

    const pedidoResult = await executeQuery(pedidoQuery)

    if (!pedidoResult || pedidoResult.length === 0) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    const pedido = pedidoResult[0]

    // Obtener items del pedido
    const itemsQuery = `
      SELECT 
        ip.id,
        ip.cantidad,
        ip.precio_unitario,
        ip.subtotal,
        p.nombre as producto_nombre,
        p.marca,
        p.unidad_venta,
        p.lote,
        p.fecha_vencimiento,
        p.id as producto_id
      FROM items_pedido ip
      JOIN productos p ON ip.producto_id = p.id
      WHERE ip.nota_pedido_id = ${pedido.id}
      ORDER BY ip.id
    `

    const items = await executeQuery(itemsQuery)

    const pedidoCompleto = {
      ...pedido,
      cliente: {
        razon_social: pedido.razon_social,
        cuit: pedido.cuit,
        telefono: pedido.telefono,
        direccion: pedido.direccion,
        email: pedido.email,
      },
      items: items.map((item: any) => ({
        id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        subtotal: item.subtotal,
        producto: {
          id: item.producto_id,
          nombre: item.producto_nombre,
          marca: item.marca,
          unidad: item.unidad_venta,
          lote: item.lote,
          vencimiento: item.fecha_vencimiento,
        },
      })),
    }

    return NextResponse.json({
      success: true,
      pedido: pedidoCompleto,
    })
  } catch (error) {
    console.error("Error al obtener pedido:", error)
    return NextResponse.json({ error: "Error al obtener pedido" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const updateData = await request.json()
    console.log("Actualizando pedido:", id, updateData)

    const { cliente, items, formaPago, observaciones, total } = updateData

    // Obtener el pedido actual
    const pedidoActual = await executeQuery(`
      SELECT id, estado FROM notas_pedido WHERE numero_pedido = '${id}'
    `)

    if (!pedidoActual || pedidoActual.length === 0) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    const pedidoId = pedidoActual[0].id
    const estadoActual = pedidoActual[0].estado

    // Si el pedido estaba aprobado o rechazado, cambiar a pendiente
    const nuevoEstado = estadoActual === "aprobado" || estadoActual === "rechazado" ? "pendiente" : estadoActual

    // Actualizar o crear cliente
    let clienteId: number
    const clienteExistente = await executeQuery(`
      SELECT id FROM clientes WHERE cuit = '${cliente.cuit}'
    `)

    if (clienteExistente.length > 0) {
      clienteId = clienteExistente[0].id
      await executeQuery(`
        UPDATE clientes SET 
          razon_social = '${cliente.razonSocial}', 
          telefono = '${cliente.telefono}', 
          direccion = '${cliente.direccion}' 
        WHERE cuit = '${cliente.cuit}'
      `)
    } else {
      await executeQuery(`
        INSERT INTO clientes (razon_social, cuit, telefono, direccion)
        VALUES ('${cliente.razonSocial}', '${cliente.cuit}', '${cliente.telefono}', '${cliente.direccion}')
      `)
      const clienteCreado = await executeQuery(`SELECT id FROM clientes WHERE cuit = '${cliente.cuit}'`)
      clienteId = clienteCreado[0].id
    }

    // Actualizar la nota de pedido
    await executeQuery(`
      UPDATE notas_pedido SET 
        cliente_id = ${clienteId},
        forma_pago = '${formaPago}',
        observaciones = '${observaciones || ""}',
        total = ${total},
        estado = '${nuevoEstado}',
        fecha_aprobacion = ${nuevoEstado === "pendiente" ? "NULL" : "fecha_aprobacion"}
      WHERE numero_pedido = '${id}'
    `)

    // Eliminar items existentes
    await executeQuery(`DELETE FROM items_pedido WHERE nota_pedido_id = ${pedidoId}`)

    // Insertar nuevos items
    for (const item of items) {
      await executeQuery(`
        INSERT INTO items_pedido (nota_pedido_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (${pedidoId}, ${item.producto.id}, ${item.cantidad}, ${item.producto.precio}, ${item.subtotal})
      `)
    }

    return NextResponse.json({
      success: true,
      message: `Pedido actualizado exitosamente${nuevoEstado === "pendiente" && estadoActual !== "pendiente" ? " y cambiado a estado pendiente" : ""}`,
      estadoCambiado: nuevoEstado !== estadoActual,
      nuevoEstado,
    })
  } catch (error) {
    console.error("Error al actualizar pedido:", error)
    return NextResponse.json({ error: "Error al actualizar pedido" }, { status: 500 })
  }
}
