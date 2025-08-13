// Servicio API Mock para desarrollo sin backend

// Datos mock para desarrollo
const mockData = {
  // Usuarios de prueba con diferentes roles
  users: [
    {
      id: '1',
      cc: '12345678',
      password: 'admin123',
      nombre: 'Carlos Administrador',
      email: 'admin@sena.edu.co',
      role: 'admin',
      telefono: '3001234567',
      estado: 'activo'
    },
    {
      id: '2', 
      cc: '87654321',
      password: 'guardia123',
      nombre: 'María Guardia',
      email: 'guardia@sena.edu.co',
      role: 'guardia',
      telefono: '3007654321',
      estado: 'activo'
    },
    {
      id: '3',
      cc: '11223344',
      password: 'instructor123', 
      nombre: 'Juan Instructor',
      email: 'instructor@sena.edu.co',
      role: 'instructor',
      telefono: '3001122334',
      estado: 'activo'
    },
    {
      id: '4',
      cc: '44332211',
      password: 'estudiante123',
      nombre: 'Ana Estudiante',
      email: 'estudiante@sena.edu.co', 
      role: 'estudiante',
      telefono: '3004433221',
      estado: 'activo'
    }
  ],
  ambientes: [
    {
      id: '1',
      nombre: 'Aula 101',
      capacidad: 30,
      tipo: 'Aula',
      estado: 'disponible',
      ubicacion: 'Bloque A - Piso 1',
      descripcion: 'Aula equipada con proyector y sistema de audio',
      servicios: ['Proyector', 'Audio', 'WiFi'],
      responsable: 'Juan Instructor',
      equipos: ['30 Sillas', '1 Proyector', '1 Tablero']
    },
    {
      id: '2',
      nombre: 'Laboratorio A',
      capacidad: 20,
      tipo: 'Laboratorio',
      estado: 'disponible',
      ubicacion: 'Bloque B - Piso 2',
      descripcion: 'Laboratorio de cómputo con equipos actualizados',
      servicios: ['Computadores', 'Internet', 'Aire Acondicionado'],
      responsable: 'Juan Instructor',
      equipos: ['20 Computadores', '1 Servidor', '1 Proyector']
    },
    {
      id: '3',
      nombre: 'Sala de Conferencias',
      capacidad: 50,
      tipo: 'Auditorio',
      estado: 'disponible',
      ubicacion: 'Bloque C - Piso 1',
      descripcion: 'Auditorio para eventos y conferencias',
      servicios: ['Sistema de Audio', 'Proyector', 'Micrófono'],
      responsable: 'Carlos Administrador',
      equipos: ['50 Sillas', '1 Podium', '1 Sistema de Audio']
    }
  ],
  reservas: [
    {
      id: '1',
      ambiente: 'Aula 101',
      ambienteId: '1',
      fecha: new Date().toISOString().split('T')[0], // Fecha actual
      horaInicio: '08:00',
      horaFin: '10:00',
      hora: '08:00', // Agregar campo hora para compatibilidad
      usuario: 'Juan Instructor',
      usuarioId: '3',
      estado: 'activa', // Cambiar a 'activa' para que sea detectada
      proposito: 'Clase de Programación'
    },
    {
      id: '2',
      ambiente: 'Laboratorio A',
      ambienteId: '2', 
      fecha: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mañana
      horaInicio: '14:00',
      horaFin: '16:00',
      hora: '14:00', // Agregar campo hora para compatibilidad
      usuario: 'Ana Estudiante',
      usuarioId: '4',
      estado: 'pendiente',
      proposito: 'Práctica de laboratorio'
    },
    {
      id: '3',
      ambiente: 'Sala de Conferencias',
      ambienteId: '3',
      fecha: new Date().toISOString().split('T')[0], // Fecha actual
      horaInicio: '15:00',
      horaFin: '17:00',
      hora: '15:00', // Agregar campo hora para compatibilidad
      usuario: 'Carlos Administrador',
      usuarioId: '1',
      estado: 'activa', // Otra reserva activa
      proposito: 'Reunión administrativa'
    }
  ]
};

// Simular delay de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función auxiliar para generar JWT mock
const generateMockJWT = (userData) => {
  // Simular un JWT (en producción esto vendría del backend)
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(JSON.stringify({
    ...userData,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 días
  }));
  const signature = 'mock_signature';
  
  return `${header}.${payload}.${signature}`;
};

const apiMock = {
  // Autenticación
  login: async (credentials) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = mockData.users.find(u => 
        u.cc === credentials.cc && u.password === credentials.password
      );
      
      if (user) {
        const userData = {
          id: user.id,
          cc: user.cc,
          nombre: user.nombre,
          email: user.email,
          role: user.role
        };
        
        const token = generateMockJWT(userData);
        
        return {
          success: true,
          message: 'Login exitoso',
          token,
          user: userData
        };
      } else {
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  },

  async logout() {
    await delay(500);
    return { success: true };
  },

  // Ambientes
  async getAmbientes() {
    await delay(800);
    return {
      success: true,
      data: mockData.ambientes
    };
  },

  async createAmbiente(ambiente) {
    await delay(1000);
    const newAmbiente = {
      id: Date.now().toString(),
      ...ambiente
    };
    mockData.ambientes.push(newAmbiente);
    return {
      success: true,
      data: newAmbiente
    };
  },

  // Reservas
  async getReservas() {
    await delay(800);
    return {
      success: true,
      data: mockData.reservas
    };
  },

  async createReserva(reserva) {
    await delay(1000);
    const newReserva = {
      id: Date.now().toString(),
      ...reserva,
      estado: 'activa'
    };
    mockData.reservas.push(newReserva);
    return {
      success: true,
      data: newReserva
    };
  },

  // Dashboard stats
  async getDashboardStats() {
    await delay(600);
    return {
      success: true,
      data: {
        totalAmbientes: mockData.ambientes.length,
        totalReservas: mockData.reservas.length,
        reservasHoy: 1,
        ambientesDisponibles: mockData.ambientes.filter(a => a.estado === 'disponible').length
      }
    };
  }
};

export default apiMock;
// Asegurar que ambientes y reservas tengan IDs consistentes