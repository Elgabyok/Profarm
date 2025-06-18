// app/api/auth/login/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
// Puedes usar bcrypt para verificar contraseñas en una implementación real
// import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { email, password, userType } = await request.json();

    if (!email || !password || !userType) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
    }

    // En una implementación real, verificarías la contraseña con bcrypt
    // Por ahora, solo verificamos que el usuario exista
    const users = await executeQuery(
      `SELECT id, email, nombre, tipo_usuario 
       FROM usuarios 
       WHERE email = '${email}' 
       AND tipo_usuario = '${userType}'`
    );

    if (users.length === 0) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const user = users[0];

    // En una implementación real, generarías un JWT
    const token = "fake-jwt-token";

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.nombre,
        type: user.tipo_usuario,
      },
      token,
    });
  } catch (error) {
    console.error("Error de autenticación:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}