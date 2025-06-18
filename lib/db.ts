import sql from 'mssql';

const config = {
  user: 'ProfarmMJ_SQLLogin_1',
  password: 'hws33ugrex',
  server: 'profarm.mssql.somee.com',
  database: 'profarm',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  }
};
// workstation id=profarm.mssql.somee.com;packet size=4096;user id=ProfarmMJ_SQLLogin_1;pwd=hws33ugrex;data source=profarm.mssql.somee.com;persist security info=False;initial catalog=profarm;TrustServerCertificate=True
// Función para ejecutar consultas SQL
export async function executeQuery(query: string, params: any[] = []) {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .query(query);
    return result.recordset;
  } catch (error) {
    console.error('Error de base de datos:', error);
    throw error;
  }
}

// Función para ejecutar procedimientos almacenados
export async function executeProcedure(procedure: string, params: { [key: string]: any } = {}) {
  try {
    const pool = await sql.connect(config);
    const request = pool.request();
    
    // Agregar parámetros
    Object.entries(params).forEach(([key, value]) => {
      request.input(key, value);
    });
    
    const result = await request.execute(procedure);
    return result.recordset;
  } catch (error) {
    console.error('Error de base de datos:', error);
    throw error;
  }
}
// Singleton para mantener la conexión
let sqlInstance: typeof sql | null = null;

export function getSqlInstance() {
  if (!sqlInstance) {
    sqlInstance = sql;
  }
  return sqlInstance;
}