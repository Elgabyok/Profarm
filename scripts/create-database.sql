-- Crear base de datos para el sistema de gestión de pedidos agroquímicos

-- Tabla de usuarios (vendedores y gerentes)
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('vendedor', 'gerente')),
    zona VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    razon_social VARCHAR(255) NOT NULL,
    cuit VARCHAR(13) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    direccion TEXT,
    email VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de productos agroquímicos
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    unidad_venta VARCHAR(20) NOT NULL CHECK (unidad_venta IN ('litro', 'gramo', 'kilo', 'unidad')),
    precio DECIMAL(10,2) NOT NULL,
    stock_actual INTEGER NOT NULL DEFAULT 0,
    stock_minimo INTEGER DEFAULT 10,
    lote VARCHAR(50),
    fecha_vencimiento DATE,
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de notas de pedido
CREATE TABLE notas_pedido (
    id SERIAL PRIMARY KEY,
    numero_pedido VARCHAR(20) UNIQUE NOT NULL,
    vendedor_id INTEGER REFERENCES usuarios(id),
    cliente_id INTEGER REFERENCES clientes(id),
    fecha_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
    forma_pago VARCHAR(50) NOT NULL,
    observaciones TEXT,
    estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
    total DECIMAL(12,2) NOT NULL,
    fecha_aprobacion TIMESTAMP,
    aprobado_por INTEGER REFERENCES usuarios(id),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de items de pedido (detalle de productos en cada pedido)
CREATE TABLE items_pedido (
    id SERIAL PRIMARY KEY,
    nota_pedido_id INTEGER REFERENCES notas_pedido(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de movimientos de stock
CREATE TABLE movimientos_stock (
    id SERIAL PRIMARY KEY,
    producto_id INTEGER REFERENCES productos(id),
    tipo_movimiento VARCHAR(20) NOT NULL CHECK (tipo_movimiento IN ('entrada', 'salida', 'ajuste')),
    cantidad INTEGER NOT NULL,
    stock_anterior INTEGER NOT NULL,
    stock_nuevo INTEGER NOT NULL,
    referencia VARCHAR(100), -- Puede ser número de pedido, factura, etc.
    observaciones TEXT,
    usuario_id INTEGER REFERENCES usuarios(id),
    fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_notas_pedido_vendedor ON notas_pedido(vendedor_id);
CREATE INDEX idx_notas_pedido_cliente ON notas_pedido(cliente_id);
CREATE INDEX idx_notas_pedido_estado ON notas_pedido(estado);
CREATE INDEX idx_notas_pedido_fecha ON notas_pedido(fecha_pedido);
CREATE INDEX idx_items_pedido_nota ON items_pedido(nota_pedido_id);
CREATE INDEX idx_items_pedido_producto ON items_pedido(producto_id);
CREATE INDEX idx_movimientos_stock_producto ON movimientos_stock(producto_id);
CREATE INDEX idx_productos_activo ON productos(activo);
CREATE INDEX idx_clientes_activo ON clientes(activo);

-- Función para generar número de pedido automático
CREATE OR REPLACE FUNCTION generar_numero_pedido()
RETURNS TRIGGER AS $$
DECLARE
    nuevo_numero VARCHAR(20);
    contador INTEGER;
BEGIN
    -- Obtener el siguiente número secuencial para el año actual
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_pedido FROM 8) AS INTEGER)), 0) + 1
    INTO contador
    FROM notas_pedido
    WHERE numero_pedido LIKE 'NP-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-%';
    
    -- Generar el nuevo número de pedido
    nuevo_numero := 'NP-' || EXTRACT(YEAR FROM CURRENT_DATE) || '-' || LPAD(contador::TEXT, 4, '0');
    
    NEW.numero_pedido := nuevo_numero;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar número de pedido automáticamente
CREATE TRIGGER trigger_generar_numero_pedido
    BEFORE INSERT ON notas_pedido
    FOR EACH ROW
    EXECUTE FUNCTION generar_numero_pedido();

-- Función para actualizar stock cuando se aprueba un pedido
CREATE OR REPLACE FUNCTION actualizar_stock_aprobacion()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo ejecutar cuando el estado cambia a 'aprobado'
    IF NEW.estado = 'aprobado' AND OLD.estado = 'pendiente' THEN
        -- Actualizar stock de cada producto en el pedido
        UPDATE productos 
        SET stock_actual = stock_actual - ip.cantidad
        FROM items_pedido ip
        WHERE productos.id = ip.producto_id 
        AND ip.nota_pedido_id = NEW.id;
        
        -- Registrar movimientos de stock
        INSERT INTO movimientos_stock (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, referencia, usuario_id)
        SELECT 
            ip.producto_id,
            'salida',
            ip.cantidad,
            p.stock_actual + ip.cantidad,
            p.stock_actual,
            NEW.numero_pedido,
            NEW.aprobado_por
        FROM items_pedido ip
        JOIN productos p ON p.id = ip.producto_id
        WHERE ip.nota_pedido_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar stock automáticamente
CREATE TRIGGER trigger_actualizar_stock_aprobacion
    AFTER UPDATE ON notas_pedido
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_stock_aprobacion();
