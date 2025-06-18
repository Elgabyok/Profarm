"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sprout, Users, Package, Truck } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [userType, setUserType] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, userType }),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("token", data.token)

        if (data.user.type === "vendedor") {
          router.push("/vendedor/dashboard")
        } else if (data.user.type === "gerente") {
          router.push("/gerente/dashboard")
        } else if (data.user.type === "despachante") {
          router.push("/despachante/dashboard")
        }
      } else {
        setError(data.error || "Error al iniciar sesión")
      }
    } catch (error) {
      console.error("Error de login:", error)
      setError("Error de conexión. Intenta nuevamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-800">AgroVentas</CardTitle>
          <CardDescription>Sistema de Gestión de Pedidos Agroquímicos</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">{error}</div>}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userType">Tipo de Usuario</Label>
              <Select value={userType} onValueChange={setUserType} required disabled={loading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vendedor">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Vendedor
                    </div>
                  </SelectItem>
                  <SelectItem value="gerente">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Gerente de Ventas
                    </div>
                  </SelectItem>
                  <SelectItem value="despachante">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Depósito y Despacho
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
