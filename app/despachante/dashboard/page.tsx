"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  FileText,
  CheckCircle,
  LogOut,
  Search,
  Filter,
  Eye,
  Package,
  Truck,
  Calendar,
  Users,
  Check,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Usuario {
  id: number
  email: string
  name: string
  type: string
}

interface Pedido {
  id: string
  vendedor: string
  cliente: string
  fecha: string
  total: number
  estado: string
  items: number
  formaPago: string
}

interface Metricas {
  pedidosAprobados: number
  pedidosFinalizados: number
  totalVentas: number
  vendedoresActivos: number
}

export default function DespachanteDashboard() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [user, setUser] = useState<Usuario | null>(null)
  const [metricas, setMetricas] = useState<Metricas>({
    pedidosAprobados: 0,
    pedidosFinalizados: 0,
    totalVentas: 0,
    vendedoresActivos: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [busqueda, setBusqueda] = useState("")
  const [filtroEstado, setFiltroEstado] = useState("aprobado")
  const [filtroVendedor, setFiltroVendedor] = useState("todos")

  const router = useRouter()

  // Verificar autenticación
  useEffect(() => {
    const userJson = localStorage.getItem("user")
    if (!userJson) {
      router.push("/")
      return
    }

    try {
      const userData: Usuario = JSON.parse(userJson)
      if (userData.type !== "despachante") {
        router.push("/")
        return
      }
      setUser(userData)
    } catch (error) {
      console.error("Error al parsear datos de usuario:", error)
      router.push("/")
    }
  }, [router])

  // Cargar pedidos
  const cargarPedidos = async () => {
    try {
      setLoading(true)
      setError("")

      // Cargar pedidos aprobados y finalizados
      const response = await fetch("/api/pedidos")
      const data = await response.json()

      if (data.success) {
        const todosLosPedidos: Pedido[] = data.pedidos || []

        // Filtrar solo pedidos aprobados y finalizados
        const pedidosRelevantes = todosLosPedidos.filter((p) => p.estado === "aprobado" || p.estado === "finalizado")

        setPedidos(pedidosRelevantes)

        // Calcular métricas
        const pedidosAprobados = pedidosRelevantes.filter((p) => p.estado === "aprobado").length
        const pedidosFinalizados = pedidosRelevantes.filter((p) => p.estado === "finalizado").length
        const totalVentas = pedidosRelevantes.reduce((sum: number, p: Pedido) => sum + (p.total || 0), 0)
        const vendedoresActivos = [...new Set(pedidosRelevantes.map((p: Pedido) => p.vendedor))].length

        setMetricas({
          pedidosAprobados,
          pedidosFinalizados,
          totalVentas,
          vendedoresActivos,
        })
      } else {
        setError(data.error || "Error al cargar pedidos")
      }
    } catch (error) {
      console.error("Error al cargar pedidos:", error)
      setError("Error de conexión al cargar pedidos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      cargarPedidos()
    }
  }, [user])

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/")
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "aprobado":
        return (
          <Badge variant="default" className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Aprobado
          </Badge>
        )
      case "finalizado":
        return (
          <Badge variant="default" className="bg-blue-600">
            <Check className="w-3 h-3 mr-1" />
            Finalizado
          </Badge>
        )
      default:
        return <Badge variant="outline">{estado}</Badge>
    }
  }

  // Filtrar pedidos
  const pedidosFiltrados = pedidos.filter((pedido) => {
    const matchBusqueda =
      pedido.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.vendedor.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.id.toLowerCase().includes(busqueda.toLowerCase())

    const matchEstado = filtroEstado === "todos" || pedido.estado === filtroEstado
    const matchVendedor = filtroVendedor === "todos" || pedido.vendedor === filtroVendedor

    return matchBusqueda && matchEstado && matchVendedor
  })

  // Obtener lista única de vendedores
  const vendedores = [...new Set(pedidos.map((p) => p.vendedor))].sort()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Panel Despachante</h1>
                <p className="text-sm text-gray-500">{user?.name || "Cargando..."}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Para Despachar</CardTitle>
              <Package className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{loading ? "..." : metricas.pedidosAprobados}</div>
              <p className="text-xs text-muted-foreground">Pedidos aprobados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Finalizados</CardTitle>
              <Check className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{loading ? "..." : metricas.pedidosFinalizados}</div>
              <p className="text-xs text-muted-foreground">Pedidos entregados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Despachado</CardTitle>
              <FileText className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {loading ? "..." : `$${metricas.totalVentas.toLocaleString()}`}
              </div>
              <p className="text-xs text-muted-foreground">Valor total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendedores Activos</CardTitle>
              <Users className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{loading ? "..." : metricas.vendedoresActivos}</div>
              <p className="text-xs text-muted-foreground">Con pedidos</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y Lista de Pedidos */}
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Despachos</CardTitle>
            <CardDescription>Lista de pedidos aprobados y finalizados para gestionar entregas</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
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
                  <SelectItem value="aprobado">Para Despachar</SelectItem>
                  <SelectItem value="finalizado">Finalizados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroVendedor} onValueChange={setFiltroVendedor}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Vendedor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los vendedores</SelectItem>
                  {vendedores.map((vendedor) => (
                    <SelectItem key={vendedor} value={vendedor}>
                      {vendedor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tabla de Pedidos */}
            {loading ? (
              <div className="text-center py-8">
                <Package className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p>Cargando pedidos...</p>
              </div>
            ) : pedidosFiltrados.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No hay pedidos para mostrar</h3>
                <p className="text-gray-500">
                  {busqueda || filtroEstado !== "todos" || filtroVendedor !== "todos"
                    ? "No se encontraron pedidos con los filtros aplicados"
                    : "No hay pedidos para despachar en este momento"}
                </p>
              </div>
            ) : (
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
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-gray-400" />
                          {new Date(pedido.fecha).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{pedido.items} productos</TableCell>
                      <TableCell>{pedido.formaPago}</TableCell>
                      <TableCell className="font-medium">${pedido.total.toLocaleString()}</TableCell>
                      <TableCell>{getEstadoBadge(pedido.estado)}</TableCell>
                      <TableCell>
                        <Link href={`/despachante/pedido/${pedido.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-1" />
                            Ver Detalle
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
