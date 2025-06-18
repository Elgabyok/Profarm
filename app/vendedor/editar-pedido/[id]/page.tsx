"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2, Search, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

interface Producto {
  id: string
  nombre: string
  marca: string
  unidad: string
  precio: number
  stock: number
  lote: string
  vencimiento: string
}

interface ItemPedido {
  producto: Producto
  cantidad: number
  subtotal: number
}

interface Cliente {
  razonSocial: string
  cuit: string
  telefono: string
  direccion: string
}

export default function EditarPedido() {
  const params = useParams()
  const router = useRouter()
  const pedidoId = params.id as string

  const [cliente, setCliente] = useState<Cliente>({
    razonSocial: "",
    cuit: "",
    telefono: "",
    direccion: "",
  })

  const [formaPago, setFormaPago] = useState("")
  const [observaciones, setObservaciones] = useState("")
  const [items, setItems] = useState<ItemPedido[]>([])
  const [busquedaProducto, setBusquedaProducto] = useState("")
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [estadoOriginal, setEstadoOriginal] = useState("")

  // Cargar productos disponibles
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        const response = await fetch("/api/productos")
        const data = await response.json()
        if (data.success) {
          setProductos(data.productos)
        }
      } catch (error) {
        console.error("Error al cargar productos:", error)
      }
    }
    cargarProductos()
  }, [])

  // Cargar datos del pedido
  useEffect(() => {
    const cargarPedido = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/pedidos/${pedidoId}`)
        const data = await response.json()

        if (data.success) {
          const pedido = data.pedido
          setEstadoOriginal(pedido.estado)

          // Cargar datos del cliente
          setCliente({
            razonSocial: pedido.cliente.razon_social,
            cuit: pedido.cliente.cuit,
            telefono: pedido.cliente.telefono,
            direccion: pedido.cliente.direccion,
          })

          setFormaPago(pedido.forma_pago)
          setObservaciones(pedido.observaciones || "")

          // Convertir items del pedido al formato esperado
          const itemsConvertidos = pedido.items.map((item: any) => ({
            producto: {
              id: item.producto.id.toString(),
              nombre: item.producto.nombre,
              marca: item.producto.marca,
              unidad: item.producto.unidad,
              precio: item.precio_unitario,
              stock: 999, // No tenemos stock actual en el detalle
              lote: item.producto.lote,
              vencimiento: item.producto.vencimiento,
            },
            cantidad: item.cantidad,
            subtotal: item.subtotal,
          }))

          setItems(itemsConvertidos)
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

  const agregarProducto = (producto: Producto, cantidad: number) => {
    const itemExistente = items.find((item) => item.producto.id === producto.id)

    if (itemExistente) {
      setItems(
        items.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad, subtotal: (item.cantidad + cantidad) * producto.precio }
            : item,
        ),
      )
    } else {
      setItems([
        ...items,
        {
          producto,
          cantidad,
          subtotal: cantidad * producto.precio,
        },
      ])
    }
  }

  const eliminarItem = (productoId: string) => {
    setItems(items.filter((item) => item.producto.id !== productoId))
  }

  const calcularTotal = () => {
    return items.reduce((total, item) => total + item.subtotal, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const pedidoData = {
        cliente,
        items,
        formaPago,
        observaciones,
        total: calcularTotal(),
      }

      const response = await fetch(`/api/pedidos/${pedidoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pedidoData),
      })

      const data = await response.json()

      if (data.success) {
        alert(data.message)
        router.push("/vendedor/dashboard")
      } else {
        alert("Error: " + data.error)
      }
    } catch (error) {
      console.error("Error al actualizar pedido:", error)
      alert("Error de conexión al actualizar pedido")
    } finally {
      setSaving(false)
    }
  }

  const productosFiltrados = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      producto.marca.toLowerCase().includes(busquedaProducto.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Cargando pedido...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
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
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Editar Nota de Pedido</h1>
              <p className="text-sm text-gray-500">{pedidoId}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {(estadoOriginal === "aprobado" || estadoOriginal === "rechazado") && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Atención</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Este pedido está en estado "{estadoOriginal}". Al guardarlo, cambiará automáticamente a "pendiente"
                    y requerirá nueva aprobación.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Datos del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle>Datos del Cliente</CardTitle>
              <CardDescription>Información del cliente para la nota de pedido</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="razonSocial">Razón Social</Label>
                <Input
                  id="razonSocial"
                  value={cliente.razonSocial}
                  onChange={(e) => setCliente({ ...cliente, razonSocial: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cuit">CUIT</Label>
                <Input
                  id="cuit"
                  value={cliente.cuit}
                  onChange={(e) => setCliente({ ...cliente, cuit: e.target.value })}
                  placeholder="XX-XXXXXXXX-X"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={cliente.telefono}
                  onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={cliente.direccion}
                  onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Selección de Productos */}
          <Card>
            <CardHeader>
              <CardTitle>Productos Disponibles</CardTitle>
              <CardDescription>Busca y agrega productos a la nota de pedido</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar productos..."
                    value={busquedaProducto}
                    onChange={(e) => setBusquedaProducto(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productosFiltrados.map((producto) => (
                    <TableRow key={producto.id}>
                      <TableCell className="font-medium">{producto.nombre}</TableCell>
                      <TableCell>{producto.marca}</TableCell>
                      <TableCell>{producto.unidad}</TableCell>
                      <TableCell>${producto.precio.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={producto.stock > 50 ? "default" : "destructive"}>{producto.stock}</Badge>
                      </TableCell>
                      <TableCell>{producto.lote}</TableCell>
                      <TableCell>{producto.vencimiento}</TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => {
                            const cantidad = prompt("Cantidad a agregar:")
                            if (cantidad && Number.parseInt(cantidad) > 0) {
                              agregarProducto(producto, Number.parseInt(cantidad))
                            }
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Items del Pedido */}
          {items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Items del Pedido</CardTitle>
                <CardDescription>Productos agregados a la nota de pedido</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio Unit.</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead>Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.producto.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.producto.nombre}</div>
                            <div className="text-sm text-muted-foreground">{item.producto.marca}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {item.cantidad} {item.producto.unidad}
                        </TableCell>
                        <TableCell>${item.producto.precio.toLocaleString()}</TableCell>
                        <TableCell className="font-medium">${item.subtotal.toLocaleString()}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => eliminarItem(item.producto.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4 flex justify-end">
                  <div className="text-right">
                    <div className="text-lg font-semibold">Total: ${calcularTotal().toLocaleString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Forma de Pago y Observaciones */}
          <Card>
            <CardHeader>
              <CardTitle>Detalles del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="formaPago">Forma de Pago</Label>
                <Select value={formaPago} onValueChange={setFormaPago} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona forma de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contado">Contado</SelectItem>
                    <SelectItem value="30dias">30 días</SelectItem>
                    <SelectItem value="60dias">60 días</SelectItem>
                    <SelectItem value="90dias">90 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/vendedor/dashboard">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={items.length === 0 || saving}>
              {saving ? "Guardando..." : "Actualizar Pedido"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}