import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get("estado")
    const vendedorId = searchParams.get("vendedorId")

    let query = `
      SELECT 
        np.numero_pedido as id,
        u.nombre as vendedor,
        c.razon_social as cliente,
        np.fecha_pedido as fecha,
        np.total,
        np.estado,
        np.forma_pago as formaPago,
        COUNT(ip.id) as items
      FROM notas_pedido np
      JOIN usuarios u ON np.vendedor_id = u.id
      JOIN clientes c ON np.cliente_id = c.id
      LEFT JOIN items_pedido ip ON np.id = ip.nota_pedido_id
    `

    const conditions: string[] = []

    if (vendedorId) {
      conditions.push(`np.vendedor_id = ${vendedorId}`)
    }

    if (estado && estado !== "todos") {
      conditions.push(`np.estado = '${estado}'`)
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`
    }

    query += ` GROUP BY np.id, np.numero_pedido, u.nombre, c.razon_social, np.fecha_pedido, np.total, np.estado, np.forma_pago ORDER BY np.fecha_pedido DESC`

    const pedidos = await executeQuery(query)

    return NextResponse.json({
      success: true,
      pedidos,
    })
  } catch (error) {
    console.error("Error al obtener pedidos:", error)
    return NextResponse.json({ error: "Error al obtener pedidos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const pedidoData = await request.json()
    console.log("=== INICIO CREACIÓN PEDIDO ===")
    console.log("Datos del pedido recibidos:", pedidoData)

    const { cliente, items, formaPago, observaciones, total, vendedorId } = pedidoData

    // Validaciones básicas
    if (!cliente || !items || items.length === 0 || !formaPago || !vendedorId) {
      return NextResponse.json(
        {
          error: "Faltan datos requeridos para crear el pedido",
        },
        { status: 400 },
      )
    }

    // 1. Ver qué pedidos existen actualmente
    const pedidosExistentes = await executeQuery(`
      SELECT numero_pedido, id 
      FROM notas_pedido 
      ORDER BY numero_pedido
    `)
    console.log("Pedidos existentes:", pedidosExistentes)

    // 2. Generar número de pedido de forma simple
    const año = new Date().getFullYear()

    // Contar cuántos pedidos hay para este año
    const conteoResult = await executeQuery(`
      SELECT COUNT(*) as total
      FROM notas_pedido 
      WHERE numero_pedido LIKE 'NP-${año}-%'
    `)

    const totalPedidos = conteoResult[0]?.total || 0
    const siguienteNumero = totalPedidos + 1
    const numeroPedido = `NP-${año}-${siguienteNumero.toString().padStart(4, "0")}`

    console.log("Total pedidos del año:", totalPedidos)
    console.log("Siguiente número:", siguienteNumero)
    console.log("Número de pedido a generar:", numeroPedido)

    // 3. Verificar que el número no existe
    const existeResult = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM notas_pedido 
      WHERE numero_pedido = '${numeroPedido}'
    `)

    console.log("¿Existe el número?", existeResult[0].count > 0)

    if (existeResult[0].count > 0) {
      // Si existe, usar timestamp para hacer único
      const timestamp = Date.now().toString().slice(-4)
      const numeroPedidoAlt = `NP-${año}-${timestamp}`
      console.log("Número alternativo:", numeroPedidoAlt)

      return NextResponse.json(
        {
          error: `El número ${numeroPedido} ya existe. Se intentaría usar ${numeroPedidoAlt}`,
        },
        { status: 400 },
      )
    }

    // 4. Insertar o buscar cliente
    let clienteId: number

    console.log("Buscando cliente con CUIT:", cliente.cuit)
    const clienteExistente = await executeQuery(`
      SELECT id FROM clientes WHERE cuit = '${cliente.cuit}'
    `)

    if (clienteExistente.length > 0) {
      clienteId = clienteExistente[0].id
      console.log("Cliente encontrado con ID:", clienteId)
    } else {
      console.log("Creando nuevo cliente...")
      await executeQuery(`
        INSERT INTO clientes (razon_social, cuit, telefono, direccion)
        VALUES ('${cliente.razonSocial}', '${cliente.cuit}', '${cliente.telefono}', '${cliente.direccion}')
      `)

      const clienteCreado = await executeQuery(`
        SELECT id FROM clientes WHERE cuit = '${cliente.cuit}'
      `)
      clienteId = clienteCreado[0].id
      console.log("Cliente creado con ID:", clienteId)
    }

    // 5. Crear la nota de pedido
    console.log("Insertando nota de pedido...")
    const insertQuery = `
      INSERT INTO notas_pedido (numero_pedido, vendedor_id, cliente_id, fecha_pedido, forma_pago, observaciones, total, estado)
      VALUES ('${numeroPedido}', ${vendedorId}, ${clienteId}, '${new Date().toISOString().split("T")[0]}', '${formaPago}', '${observaciones || ""}', ${total}, 'pendiente')
    `
    console.log("Query de inserción:", insertQuery)

    await executeQuery(insertQuery)
    console.log("Nota de pedido insertada")

    // 6. Verificar que se insertó correctamente
    console.log("Verificando inserción...")
    const pedidoResult = await executeQuery(`
      SELECT id, numero_pedido, fecha_pedido, estado 
      FROM notas_pedido 
      WHERE numero_pedido = '${numeroPedido}'
    `)

    console.log("Resultado de verificación:", pedidoResult)

    if (!pedidoResult || pedidoResult.length === 0) {
      throw new Error(`No se encontró el pedido ${numeroPedido} después de insertar`)
    }

    const pedidoCreado = pedidoResult[0]
    console.log("Pedido creado exitosamente:", pedidoCreado)

    // 7. Insertar items del pedido
    console.log("Insertando items del pedido...")
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      console.log(`Insertando item ${i + 1}/${items.length}:`, {
        producto_id: item.producto.id,
        cantidad: item.cantidad,
        precio: item.producto.precio,
        subtotal: item.subtotal,
      })

      const itemQuery = `
        INSERT INTO items_pedido (nota_pedido_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (${pedidoCreado.id}, ${item.producto.id}, ${item.cantidad}, ${item.producto.precio}, ${item.subtotal})
      `
      console.log("Query item:", itemQuery)

      await executeQuery(itemQuery)
      console.log(`Item ${i + 1} insertado exitosamente`)
    }

    console.log("=== PEDIDO CREADO EXITOSAMENTE ===")

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      pedido: {
        id: pedidoCreado.numero_pedido,
        numeroInterno: pedidoCreado.id,
        fecha: pedidoCreado.fecha_pedido,
        estado: pedidoCreado.estado,
        total: total,
        cliente: cliente.razonSocial,
        items: items.length,
      },
      message: "Pedido creado exitosamente",
    })
  } catch (error) {
    console.error("=== ERROR AL CREAR PEDIDO ===")
    console.error("Error completo:", error)
    console.error("Stack trace:", (error as Error).stack)

    return NextResponse.json(
      {
        error: "Error interno al crear el pedido: " + (error as Error).message,
      },
      { status: 500 },
    )
  }
}
