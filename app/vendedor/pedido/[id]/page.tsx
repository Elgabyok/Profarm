"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Clock, CheckCircle, XCircle, Edit, Package } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

interface Cliente {
  razon_social: string
  cuit: string
  telefono: string
  direccion: string
  email?: string
}

interface Producto {
  id: number
  nombre: string
  marca: string
  unidad: string
  lote: string
  vencimiento: string
}

interface Item {
  id: number
  cantidad: number
  precio_unitario: number
  subtotal: number
  producto: Producto
}

interface PedidoDetalle {
  id: number
  numero_pedido: string
  fecha_pedido: string
  forma_pago: string
  observaciones: string
  estado: string
  total: number
  fecha_aprobacion?: string
  vendedor: string
  cliente: Cliente
  items: Item[]
}

export default function DetallePedido() {
  const params = useParams()
  const router = useRouter()
  const [pedido, setPedido] = useState<PedidoDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const pedidoId = params.id as string

  useEffect(() => {
    const cargarPedido = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/pedidos/${pedidoId}`)
        const data = await response.json()

        if (data.success) {
          setPedido(data.pedido)
        } else {
          setError(data.error || "Error al cargar pedido")
        }
      } catch (error) {
        console.error("Error:", error)
        setError("Error de conexión")
      } finally {
        setLoading(false)
      }
    }

    if (pedidoId) {
      cargarPedido()
    }
  }, [pedidoId])

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return (
          <Badge variant="secondary" className="text-sm">
            <Clock className="w-4 h-4 mr-1" />
            Pendiente
          </Badge>
        )
      case "aprobado":
        return (
          <Badge variant="default" className="bg-green-600 text-sm">
            <CheckCircle className="w-4 h-4 mr-1" />
            Aprobado
          </Badge>
        )
      case "rechazado":
        return (
          <Badge variant="destructive" className="text-sm">
            <XCircle className="w-4 h-4 mr-1" />
            Rechazado
          </Badge>
        )
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Cargando detalle del pedido...</p>
        </div>
      </div>
    )
  }

  if (error || !pedido) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Link href="/vendedor/dashboard">
                <Button>Volver al Dashboard</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 py-4">
            <Link href="/vendedor/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">Detalle de Pedido</h1>
              <p className="text-sm text-gray-500">{pedido.numero_pedido}</p>
            </div>
            <div className="flex gap-2">
              {getEstadoBadge(pedido.estado)}
              <Link href={`/vendedor/editar-pedido/${pedido.numero_pedido}`}>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información del Pedido */}
          <div className="lg:col-span-2 space-y-6">
            {/* Datos del Cliente */}
            <Card>
              <CardHeader>
                <CardTitle>Datos del Cliente</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Razón Social</label>
                  <p className="text-sm">{pedido.cliente.razon_social}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">CUIT</label>
                  <p className="text-sm">{pedido.cliente.cuit}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Teléfono</label>
                  <p className="text-sm">{pedido.cliente.telefono}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Dirección</label>
                  <p className="text-sm">{pedido.cliente.direccion}</p>
                </div>
              </CardContent>
            </Card>

            {/* Items del Pedido */}
            <Card>
              <CardHeader>
                <CardTitle>Productos del Pedido</CardTitle>
                <CardDescription>{pedido.items.length} productos en este pedido</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio Unit.</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedido.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.producto.nombre}</div>
                            <div className="text-sm text-gray-500">
                              {item.producto.marca} - Lote: {item.producto.lote}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.cantidad} {item.producto.unidad}
                        </TableCell>
                        <TableCell>${item.precio_unitario.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">${item.subtotal.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 flex justify-end">
                  <div className="text-right">
                    <div className="text-lg font-semibold">Total: ${pedido.total.toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Información Lateral */}
          <div className="space-y-6">
            {/* Resumen del Pedido */}
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Número de Pedido</label>
                  <p className="text-sm font-mono">{pedido.numero_pedido}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha</label>
                  <p className="text-sm">{new Date(pedido.fecha_pedido).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Vendedor</label>
                  <p className="text-sm">{pedido.vendedor}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <div className="mt-1">{getEstadoBadge(pedido.estado)}</div>
                </div>
                {pedido.fecha_aprobacion && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fecha de Aprobación</label>
                    <p className="text-sm">{new Date(pedido.fecha_aprobacion).toLocaleDateString()}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Detalles de Pago */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles de Pago</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Forma de Pago</label>
                  <p className="text-sm">{pedido.forma_pago}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total</label>
                  <p className="text-lg font-semibold">${pedido.total.toLocaleString()}</p>
                </div>
                {pedido.observaciones && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Observaciones</label>
                    <p className="text-sm">{pedido.observaciones}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}