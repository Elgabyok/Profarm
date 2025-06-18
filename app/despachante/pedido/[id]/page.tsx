"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, CheckCircle, Package, Truck, Calendar, User, MapPin, Phone, Check } from "lucide-react"
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
  fecha_finalizacion?: string
  vendedor: string
  cliente: Cliente
  items: Item[]
}

export default function DetallePedidoDespachante() {
  const params = useParams()
  const router = useRouter()
  const [pedido, setPedido] = useState<PedidoDetalle | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [finalizando, setFinalizando] = useState(false)

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

  const handleFinalizarPedido = async () => {
    if (!pedido) return

    const confirmar = window.confirm(
      `¿Estás seguro de que quieres finalizar el pedido ${pedido.numero_pedido}?\n\nEsto indica que el producto ya fue entregado al cliente y no se puede deshacer.`,
    )

    if (!confirmar) return

    try {
      setFinalizando(true)

      // Obtener datos del usuario desde localStorage
      const userJson = localStorage.getItem("user")
      if (!userJson) {
        alert("Error: No se encontraron datos de usuario")
        return
      }

      const userData = JSON.parse(userJson)

      const response = await fetch(`/api/pedidos/${pedidoId}/finalizar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuarioId: userData.id,
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert("Pedido finalizado exitosamente")
        // Actualizar el estado local del pedido
        setPedido((prev) =>
          prev ? { ...prev, estado: "finalizado", fecha_finalizacion: new Date().toISOString() } : null,
        )
      } else {
        alert("Error: " + data.error)
      }
    } catch (error) {
      console.error("Error al finalizar pedido:", error)
      alert("Error de conexión al finalizar pedido")
    } finally {
      setFinalizando(false)
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "aprobado":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            Aprobado
          </Badge>
        )
      case "finalizado":
        return (
          <Badge variant="default" className="bg-blue-600">
            <Check className="w-4 h-4 mr-1" />
            Finalizado
          </Badge>
        )
      default:
        return <Badge variant="secondary">{estado}</Badge>
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
              <Package className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Link href="/despachante/dashboard">
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
            <Link href="/despachante/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-900">Detalle para Despacho</h1>
              <p className="text-sm text-gray-500">{pedido.numero_pedido}</p>
            </div>
            {getEstadoBadge(pedido.estado)}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Datos del Cliente y Entrega */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Información de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cliente</label>
                    <p className="text-lg font-semibold">{pedido.cliente.razon_social}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">CUIT</label>
                    <p className="text-sm">{pedido.cliente.cuit}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      Vendedor
                    </label>
                    <p className="text-sm">{pedido.vendedor}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Dirección de Entrega
                    </label>
                    <p className="text-sm font-medium">{pedido.cliente.direccion}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      Teléfono
                    </label>
                    <p className="text-sm">{pedido.cliente.telefono}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Fecha de Aprobación
                    </label>
                    <p className="text-sm">
                      {pedido.fecha_aprobacion
                        ? new Date(pedido.fecha_aprobacion).toLocaleDateString()
                        : "No disponible"}
                    </p>
                  </div>
                  {pedido.fecha_finalizacion && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        Fecha de Finalización
                      </label>
                      <p className="text-sm">{new Date(pedido.fecha_finalizacion).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Lista de Productos para Preparar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Productos a Preparar
                </CardTitle>
                <CardDescription>
                  {pedido.items.length} productos en este pedido - Verificar stock y lotes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Lote</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Ubicación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pedido.items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.producto.nombre}</div>
                            <div className="text-sm text-gray-500">{item.producto.marca}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {item.producto.lote}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">{new Date(item.producto.vencimiento).toLocaleDateString()}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {item.cantidad} {item.producto.unidad}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-500">
                            {/* Aquí podrías agregar información de ubicación en depósito */}
                            Depósito A-{index + 1}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Observaciones */}
            {pedido.observaciones && (
              <Card>
                <CardHeader>
                  <CardTitle>Observaciones del Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm bg-yellow-50 p-3 rounded border border-yellow-200">{pedido.observaciones}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Resumen del Pedido */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Resumen de Despacho
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Número de Pedido</label>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">{pedido.numero_pedido}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha del Pedido</label>
                  <p className="text-sm">{new Date(pedido.fecha_pedido).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total de Items</label>
                  <p className="text-lg font-semibold">{pedido.items.length} productos</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Forma de Pago</label>
                  <p className="text-sm">{pedido.forma_pago}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Valor Total</label>
                  <p className="text-xl font-bold text-green-600">${pedido.total.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Estado</label>
                  <div className="mt-1">{getEstadoBadge(pedido.estado)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Acciones de Despacho */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {pedido.estado === "aprobado" && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleFinalizarPedido}
                    disabled={finalizando}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {finalizando ? "Finalizando..." : "Finalizar Pedido"}
                  </Button>
                )}

                {pedido.estado === "finalizado" && (
                  <div className="w-full p-3 bg-blue-50 border border-blue-200 rounded text-center">
                    <Check className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm text-blue-800 font-medium">Pedido Finalizado</p>
                    <p className="text-xs text-blue-600">Producto entregado al cliente</p>
                  </div>
                )}

                <Button className="w-full" variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  Marcar como Preparado
                </Button>
                <Button className="w-full" variant="outline">
                  <Truck className="w-4 h-4 mr-2" />
                  Generar Remito
                </Button>
                <Button className="w-full" variant="outline">
                  Imprimir Lista de Picking
                </Button>
              </CardContent>
            </Card>

            {/* Información Adicional */}
            <Card>
              <CardHeader>
                <CardTitle>Información Adicional</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Peso estimado:</span>
                  <span>~{pedido.items.reduce((acc, item) => acc + item.cantidad, 0)} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bultos estimados:</span>
                  <span>{Math.ceil(pedido.items.length / 3)} bultos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Prioridad:</span>
                  <Badge variant="secondary">Normal</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
