"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  Search,
  Filter,
  Eye,
  Check,
  X,
  TrendingUp,
  Users,
  Package,
} from "lucide-react"

interface Pedido {
  id: string
  vendedor: string
  cliente: string
  fecha: string
  total: number
  estado: "pendiente" | "aprobado" | "rechazado"
  items: number
  formaPago: string
}

export default function GerenteDashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([
    {
      id: "NP-001",
      vendedor: "Juan Pérez",
      cliente: "Agropecuaria San Juan",
      fecha: "2024-01-15",
      total: 125000,
      estado: "pendiente",
      items: 3,
      formaPago: "30 días",
    },
    {
      id: "NP-002",
      vendedor: "María García",
      cliente: "Campo Verde S.A.",
      fecha: "2024-01-14",
      total: 89500,
      estado: "pendiente",
      items: 2,
      formaPago: "Contado",
    },
    {
      id: "NP-003",
      vendedor: "Carlos López",
      cliente: "Estancia La Esperanza",
      fecha: "2024-01-13",
      total: 156000,
      estado: "aprobado",
      items: 4,
      formaPago: "60 días",
    },
    {
      id: "NP-004",
      vendedor: "Ana Martínez",
      cliente: "Cooperativa Agrícola",
      fecha: "2024-01-12",
      total: 78000,
      estado: "rechazado",
      items: 2,
      formaPago: "30 días",
    },
  ])

  const [filtroEstado, setFiltroEstado] = useState("todos")
  const [busqueda, setBusqueda] = useState("")

  const aprobarPedido = (id: string) => {
    setPedidos(pedidos.map((pedido) => (pedido.id === id ? { ...pedido, estado: "aprobado" as const } : pedido)))
    // Aquí iría la lógica para actualizar el stock
    console.log(`Pedido ${id} aprobado - Actualizando stock`)
  }

  const rechazarPedido = (id: string) => {
    setPedidos(pedidos.map((pedido) => (pedido.id === id ? { ...pedido, estado: "rechazado" as const } : pedido)))
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Pendiente
          </Badge>
        )
      case "aprobado":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobado
          </Badge>
        )
      case "rechazado":
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Rechazado
          </Badge>
        )
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  const pedidosFiltrados = pedidos.filter((pedido) => {
    const matchEstado = filtroEstado === "todos" || pedido.estado === filtroEstado
    const matchBusqueda =
      pedido.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.vendedor.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.id.toLowerCase().includes(busqueda.toLowerCase())
    return matchEstado && matchBusqueda
  })

  const pedidosPendientes = pedidos.filter((p) => p.estado === "pendiente").length
  const ventasDelMes = pedidos.filter((p) => p.estado === "aprobado").reduce((sum, p) => sum + p.total, 0)
  const vendedoresActivos = [...new Set(pedidos.map((p) => p.vendedor))].length

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Panel Gerente</h1>
                <p className="text-sm text-gray-500">Roberto Silva - Gerente de Ventas</p>
              </div>
            </div>
            <Button variant="outline" size="sm">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pedidosPendientes}</div>
              <p className="text-xs text-muted-foreground">Requieren aprobación</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${ventasDelMes.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Pedidos aprobados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendedores Activos</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{vendedoresActivos}</div>
              <p className="text-xs text-muted-foreground">Con pedidos este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
              <FileText className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{pedidos.length}</div>
              <p className="text-xs text-muted-foreground">Este mes</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y Búsqueda */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Gestión de Notas de Pedido</CardTitle>
            <CardDescription>Revisa y aprueba las notas de pedido de los vendedores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por cliente, vendedor o número de pedido..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendientes</SelectItem>
                  <SelectItem value="aprobado">Aprobados</SelectItem>
                  <SelectItem value="rechazado">Rechazados</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Pedido</TableHead>
                  <TableHead>Vendedor</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Forma de Pago</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidosFiltrados.map((pedido) => (
                  <TableRow key={pedido.id}>
                    <TableCell className="font-medium">{pedido.id}</TableCell>
                    <TableCell>{pedido.vendedor}</TableCell>
                    <TableCell>{pedido.cliente}</TableCell>
                    <TableCell>{pedido.fecha}</TableCell>
                    <TableCell>{pedido.items} productos</TableCell>
                    <TableCell>{pedido.formaPago}</TableCell>
                    <TableCell className="font-medium">${pedido.total.toLocaleString()}</TableCell>
                    <TableCell>{getEstadoBadge(pedido.estado)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {pedido.estado === "pendiente" && (
                          <>
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => aprobarPedido(pedido.id)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => rechazarPedido(pedido.id)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
