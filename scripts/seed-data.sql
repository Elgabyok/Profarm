-- Insertar datos de prueba para el sistema de gestión de pedidos agroquímicos

-- Insertar usuarios (vendedores y gerentes)
INSERT INTO usuarios (email, password_hash, nombre, tipo_usuario, zona) VALUES
('juan.perez@agroventas.com', '$2b$10$example_hash_1', 'Juan Pérez', 'vendedor', 'Zona Norte'),
('maria.garcia@agroventas.com', '$2b$10$example_hash_2', 'María García', 'vendedor', 'Zona Sur'),
('carlos.lopez@agroventas.com', '$2b$10$example_hash_3', 'Carlos López', 'vendedor', 'Zona Este'),
('ana.martinez@agroventas.com', '$2b$10$example_hash_4', 'Ana Martínez', 'vendedor', 'Zona Oeste'),
('roberto.silva@agroventas.com', '$2b$10$example_hash_5', 'Roberto Silva', 'gerente', NULL);

-- Insertar clientes
INSERT INTO clientes (razon_social, cuit, telefono, direccion, email) VALUES
('Agropecuaria San Juan S.A.', '30-12345678-9', '+54 11 1234-5678', 'Av. San Martín 1234, San Juan', 'contacto@agrosanjuan.com'),
('Campo Verde S.A.', '30-87654321-0', '+54 11 8765-4321', 'Ruta 9 Km 45, Buenos Aires', 'ventas@campoverde.com'),
('Estancia La Esperanza', '27-11223344-5', '+54 11 1122-3344', 'Camino Rural 567, La Pampa', 'laesperanza@gmail.com'),
('Cooperativa Agrícola Unidos', '30-55667788-1', '+54 11 5566-7788', 'Calle Principal 890, Córdoba', 'coop.unidos@cooperativa.com'),
('Hacienda Los Álamos', '23-99887766-3', '+54 11 9988-7766', 'Ruta Provincial 12, Santa Fe', 'losalamos@hacienda.com');

-- Insertar productos agroquímicos
INSERT INTO productos (nombre, marca, unidad_venta, precio, stock_actual, stock_minimo, lote, fecha_vencimiento) VALUES
('Glifosato 48%', 'AgroMax', 'litro', 2500.00, 150, 20, 'LT2024001', '2025-12-31'),
('Atrazina 50%', 'CampoVerde', 'litro', 3200.00, 80, 15, 'LT2024002', '2025-08-15'),
('2,4-D Amina', 'AgroMax', 'litro', 1800.00, 200, 25, 'LT2024003', '2026-03-20'),
('Dicamba 48%', 'FitoControl', 'litro', 4500.00, 60, 10, 'LT2024004', '2025-11-30'),
('Paraquat 20%', 'AgroMax', 'litro', 3800.00, 90, 15, 'LT2024005', '2025-09-15'),
('Metsulfuron Metil', 'CampoVerde', 'gramo', 85.00, 500, 50, 'LT2024006', '2026-01-20'),
('Clopiralid 30%', 'FitoControl', 'litro', 5200.00, 45, 10, 'LT2024007', '2025-10-10'),
('Imazetapir 10%', 'AgroMax', 'litro', 6800.00, 35, 8, 'LT2024008', '2025-07-25'),
('Sulfato de Cobre', 'Minerales SA', 'kilo', 450.00, 300, 50, 'LT2024009', '2027-12-31'),
('Aceite Mineral', 'PetroAgro', 'litro', 1200.00, 180, 30, 'LT2024010', '2026-06-30');

-- Insertar algunas notas de pedido de ejemplo
INSERT INTO notas_pedido (vendedor_id, cliente_id, fecha_pedido, forma_pago, observaciones, estado, total) VALUES
(1, 1, '2024-01-15', '30 días', 'Cliente preferencial - entrega urgente', 'pendiente', 125000.00),
(2, 2, '2024-01-14', 'Contado', 'Pago al contado con descuento', 'pendiente', 89500.00),
(3, 3, '2024-01-13', '60 días', 'Pedido para campaña de verano', 'aprobado', 156000.00),
(4, 4, '2024-01-12', '30 días', 'Cooperativa - condiciones especiales', 'rechazado', 78000.00),
(1, 5, '2024-01-11', '90 días', 'Pedido de temporada alta', 'aprobado', 234000.00);

-- Insertar items de pedido para las notas creadas
-- Pedido NP-2024-0001 (Juan Pérez - Agropecuaria San Juan)
INSERT INTO items_pedido (nota_pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(1, 1, 20, 2500.00, 50000.00),  -- Glifosato 48%
(1, 3, 15, 1800.00, 27000.00),  -- 2,4-D Amina
(1, 9, 100, 450.00, 45000.00);  -- Sulfato de Cobre

-- Pedido NP-2024-0002 (María García - Campo Verde)
INSERT INTO items_pedido (nota_pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(2, 2, 12, 3200.00, 38400.00),  -- Atrazina 50%
(2, 5, 8, 3800.00, 30400.00),   -- Paraquat 20%
(2, 10, 15, 1200.00, 18000.00); -- Aceite Mineral

-- Pedido NP-2024-0003 (Carlos López - Estancia La Esperanza) - APROBADO
INSERT INTO items_pedido (nota_pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(3, 4, 10, 4500.00, 45000.00),  -- Dicamba 48%
(3, 7, 8, 5200.00, 41600.00),   -- Clopiralid 30%
(3, 8, 5, 6800.00, 34000.00),   -- Imazetapir 10%
(3, 1, 15, 2500.00, 37500.00);  -- Glifosato 48%

-- Pedido NP-2024-0004 (Ana Martínez - Cooperativa) - RECHAZADO
INSERT INTO items_pedido (nota_pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(4, 6, 200, 85.00, 17000.00),   -- Metsulfuron Metil
(4, 3, 25, 1800.00, 45000.00),  -- 2,4-D Amina
(4, 10, 12, 1200.00, 14400.00); -- Aceite Mineral

-- Pedido NP-2024-0005 (Juan Pérez - Hacienda Los Álamos) - APROBADO
INSERT INTO items_pedido (nota_pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES
(5, 1, 30, 2500.00, 75000.00),  -- Glifosato 48%
(5, 2, 20, 3200.00, 64000.00),  -- Atrazina 50%
(5, 4, 12, 4500.00, 54000.00),  -- Dicamba 48%
(5, 5, 10, 3800.00, 38000.00);  -- Paraquat 20%

-- Actualizar las fechas de aprobación para los pedidos aprobados
UPDATE notas_pedido 
SET fecha_aprobacion = fecha_pedido + INTERVAL '1 day', 
    aprobado_por = 5 
WHERE estado = 'aprobado';

-- Insertar algunos movimientos de stock históricos
INSERT INTO movimientos_stock (producto_id, tipo_movimiento, cantidad, stock_anterior, stock_nuevo, referencia, observaciones, usuario_id) VALUES
(1, 'entrada', 200, 0, 200, 'COMPRA-001', 'Compra inicial de stock', 5),
(2, 'entrada', 120, 0, 120, 'COMPRA-002', 'Compra inicial de stock', 5),
(3, 'entrada', 250, 0, 250, 'COMPRA-003', 'Compra inicial de stock', 5),
(4, 'entrada', 80, 0, 80, 'COMPRA-004', 'Compra inicial de stock', 5),
(5, 'entrada', 120, 0, 120, 'COMPRA-005', 'Compra inicial de stock', 5);

-- Crear vista para reportes de ventas por vendedor
CREATE VIEW vista_ventas_vendedor AS
SELECT 
    u.nombre as vendedor,
    u.zona,
    COUNT(np.id) as total_pedidos,
    COUNT(CASE WHEN np.estado = 'aprobado' THEN 1 END) as pedidos_aprobados,
    COUNT(CASE WHEN np.estado = 'pendiente' THEN 1 END) as pedidos_pendientes,
    COUNT(CASE WHEN np.estado = 'rechazado' THEN 1 END) as pedidos_rechazados,
    COALESCE(SUM(CASE WHEN np.estado = 'aprobado' THEN np.total END), 0) as ventas_aprobadas,
    COALESCE(SUM(CASE WHEN np.estado = 'pendiente' THEN np.total END), 0) as ventas_pendientes
FROM usuarios u
LEFT JOIN notas_pedido np ON u.id = np.vendedor_id
WHERE u.tipo_usuario = 'vendedor'
GROUP BY u.id, u.nombre, u.zona;

-- Crear vista para stock bajo mínimo
CREATE VIEW vista_stock_bajo AS
SELECT 
    p.id,
    p.nombre,
    p.marca,
    p.stock_actual,
    p.stock_minimo,
    p.unidad_venta,
    p.fecha_vencimiento,
    CASE 
        WHEN p.stock_actual <= p.stock_minimo THEN 'CRÍTICO'
        WHEN p.stock_actual <= p.stock_minimo * 1.5 THEN 'BAJO'
        ELSE 'NORMAL'
    END as nivel_stock
FROM productos p
WHERE p.activo = true
AND p.stock_actual <= p.stock_minimo * 1.5
ORDER BY p.stock_actual ASC;
