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
import { ArrowLeft, Plus, Trash2, Search } from 'lucide-react'
import Link from "next/link"
import { useRouter } from "next/navigation"

// Interfaces para TypeScript
interface Producto {
  id: number
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

interface Usuario {
  id: number
  email: string
  name: string
  type: string
}

export default function NuevoPedido() {
  const [cliente, setCliente] = useState({
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
  const [loading, setLoading] = useState(false)
  const [loadingProductos, setLoadingProductos] = useState(true)
  const [user, setUser] = useState<Usuario | null>(null)
  const [error, setError] = useState("")

  const router = useRouter()

  // Verificar autenticación
  useEffect(() => {
    const userJson = localStorage.getItem('user')
    if (!userJson) {
      router.push('/')
      return
    }
    
    try {
      const userData: Usuario = JSON.parse(userJson)
      if (userData.type !== 'vendedor') {
        router.push('/')
        return
      }
      setUser(userData)
    } catch (error) {
      console.error("Error al parsear datos de usuario:", error)
      router.push('/')
    }
  }, [router])

  // Cargar productos desde la API
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoadingProductos(true)
        const response = await fetch('/api/productos')
        const data = await response.json()
        
        if (data.success) {
          setProductos(data.productos || [])
        } else {
          setError('Error al cargar productos')
        }
      } catch (error) {
        console.error('Error al cargar productos:', error)
        setError('Error de conexión al cargar productos')
      } finally {
        setLoadingProductos(false)
      }
    }

    cargarProductos()
  }, [])

  const agregarProducto = (producto: Producto, cantidad: number) => {
    if (cantidad > producto.stock) {
      alert(`No hay suficiente stock. Stock disponible: ${producto.stock}`)
      return
    }

    const itemExistente = items.find((item) => item.producto.id === producto.id)

    if (itemExistente) {
      const nuevaCantidad = itemExistente.cantidad + cantidad
      if (nuevaCantidad > producto.stock) {
        alert(`No hay suficiente stock. Stock disponible: ${producto.stock}`)
        return
      }
      
      setItems(
        items.map((item) =>
          item.producto.id === producto.id
            ? { 
                ...item, 
                cantidad: nuevaCantidad, 
                subtotal: nuevaCantidad * producto.precio 
              }
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

  const eliminarItem = (productoId: number) => {
    setItems(items.filter((item) => item.producto.id !== productoId))
  }

  const calcularTotal = () => {
    return items.reduce((total, item) => total + item.subtotal, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError('Usuario no autenticado')
      return
    }

    if (items.length === 0) {
      setError('Debe agregar al menos un producto al pedido')
      return
    }

    setLoading(true)
    setError("")

    try {
      const pedido = {
        cliente,
        items,
        formaPago,
        observaciones,
        total: calcularTotal(),
        vendedorId: user.id,
      }

      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedido),
      })

      const data = await response.json()

      if (data.success) {
        alert('Nota de pedido creada exitosamente')
        router.push('/vendedor/dashboard')
      } else {
        setError(data.error || 'Error al crear el pedido')
      }
    } catch (error) {
      console.error('Error al crear pedido:', error)
      setError('Error de conexión al crear el pedido')
    } finally {
      setLoading(false)
    }
  }

  const productosFiltrados = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()) ||
      producto.marca.toLowerCase().includes(busquedaProducto.toLowerCase()),
  )

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
            <h1 className="text-xl font-semibold text-gray-900">Nueva Nota de Pedido</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

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
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={cliente.telefono}
                  onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })}
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={cliente.direccion}
                  onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
                  required
                  disabled={loading}
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
                    disabled={loading}
                  />
                </div>
              </div>

              {loadingProductos ? (
                <div className="text-center py-4">Cargando productos...</div>
              ) : productosFiltrados.length === 0 ? (
                <div className="text-center py-4">No se encontraron productos</div>
              ) : (
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
                          <Badge variant={producto.stock > 50 ? "default" : producto.stock > 10 ? "secondary" : "destructive"}>
                            {producto.stock}
                          </Badge>
                        </TableCell>
                        <TableCell>{producto.lote}</TableCell>
                        <TableCell>{producto.vencimiento}</TableCell>
                        <TableCell>
                          <Button
                            type="button"
                            size="sm"
                            disabled={loading || producto.stock === 0}
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
              )}
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
                            disabled={loading}
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
                <Select value={formaPago} onValueChange={setFormaPago} required disabled={loading}>
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
                  disabled={loading}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href="/vendedor/dashboard">
              <Button type="button" variant="outline" disabled={loading}>
                Cancelar
              </Button>
            </Link>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700" 
              disabled={items.length === 0 || loading}
            >
              {loading ? 'Creando...' : 'Crear Nota de Pedido'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}