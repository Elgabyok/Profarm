"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Package, FileText, Clock, CheckCircle, XCircle, LogOut, Eye, Edit } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

// Definir interfaces para los tipos de datos
interface Usuario {
  id: number
  email: string
  name: string
  type: string
}

interface Pedido {
  id: string
  cliente: string
  fecha: string
  total: number
  estado: string
  items: number
  formaPago?: string
}

interface Metricas {
  pedidosMes: number
  ventasMes: number
  pendientes: number
}

export default function VendedorDashboard() {
  // Especificar los tipos en los estados
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [user, setUser] = useState<Usuario | null>(null)
  const [metricas, setMetricas] = useState<Metricas>({
    pedidosMes: 0,
    ventasMes: 0,
    pendientes: 0,
  })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>("")

  const router = useRouter()

  // Función para verificar si el usuario está autenticado
  useEffect(() => {
    const userJson = localStorage.getItem("user")
    if (!userJson) {
      router.push("/")
      return
    }

    try {
      const userData: Usuario = JSON.parse(userJson)
      if (userData.type !== "vendedor") {
        router.push("/")
        return
      }
      setUser(userData)
    } catch (error) {
      console.error("Error al parsear datos de usuario:", error)
      router.push("/")
    }
  }, [router])

  // Función para cargar los pedidos desde la API
  const cargarPedidos = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError("")

      console.log("Cargando pedidos para vendedor ID:", user.id)

      const response = await fetch(`/api/pedidos?vendedorId=${user.id}`)
      const data = await response.json()

      console.log("Respuesta de la API:", data)

      if (data.success) {
        const pedidosData: Pedido[] = data.pedidos || []
        setPedidos(pedidosData)

        console.log("Pedidos cargados:", pedidosData)

        // Calcular métricas
        const pedidosMes = pedidosData.length
        const ventasMes = pedidosData
          .filter((p: Pedido) => p.estado === "aprobado")
          .reduce((sum: number, p: Pedido) => sum + (p.total || 0), 0)
        const pendientes = pedidosData.filter((p: Pedido) => p.estado === "pendiente").length

        console.log("Métricas calculadas:", { pedidosMes, ventasMes, pendientes })

        setMetricas({
          pedidosMes,
          ventasMes,
          pendientes,
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

  // Cargar pedidos cuando el usuario esté disponible
  useEffect(() => {
    if (user) {
      cargarPedidos()
    }
  }, [user])

  // Función para cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    router.push("/")
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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Panel Vendedor</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos del Mes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : metricas.pedidosMes}</div>
              <p className="text-xs text-muted-foreground">Total de pedidos este mes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ventas del Mes</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : `$${metricas.ventasMes.toLocaleString()}`}</div>
              <p className="text-xs text-muted-foreground">Pedidos aprobados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? "..." : metricas.pendientes}</div>
              <p className="text-xs text-muted-foreground">Esperando aprobación</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Mis Notas de Pedido</h2>
          <Link href="/vendedor/nuevo-pedido">
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Nota de Pedido
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historial de Pedidos</CardTitle>
            <CardDescription>Gestiona tus notas de pedido y revisa su estado</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">Cargando pedidos...</div>
            ) : pedidos.length === 0 ? (
              <div className="text-center py-4">
                <p>No hay pedidos para mostrar</p>
                <p className="text-sm text-gray-500 mt-2">Crea tu primera nota de pedido para comenzar</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° Pedido</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pedidos.map((pedido: Pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell className="font-medium">{pedido.id}</TableCell>
                      <TableCell>{pedido.cliente}</TableCell>
                      <TableCell>{new Date(pedido.fecha).toLocaleDateString()}</TableCell>
                      <TableCell>{pedido.items} productos</TableCell>
                      <TableCell>${(pedido.total || 0).toLocaleString()}</TableCell>
                      <TableCell>{getEstadoBadge(pedido.estado)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/vendedor/pedido/${pedido.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              Ver
                            </Button>
                          </Link>
                          <Link href={`/vendedor/editar-pedido/${pedido.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                          </Link>
                        </div>
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