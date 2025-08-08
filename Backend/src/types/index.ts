// Tipos base del sistema
export interface Ambiente {
  _id?: string;
  nombre: string;
  descripcion?: string;
  capacidad: number;
  tipo: 'Aula' | 'Laboratorio' | 'Auditorio' | 'Oficina' | 'Otro';
  estado: 'Disponible' | 'En mantenimiento' | 'No disponible';
  equipos: number;
  ubicacion?: string;
  servicios: string[];
  horario: string;
  responsable?: string;
  recursos?: {
    nombre: string;
    cantidad: number;
  }[];
  horarioDisponible?: {
    dias: ('Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado' | 'Domingo')[];
    horaInicio: string;
    horaFin: string;
  };
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  _id?: string;
  nombre: string;
  email: string;
  password: string;
  rol: 'admin' | 'instructor' | 'estudiante';
  activo: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Reserva {
  _id?: string;
  ambiente: string | Ambiente;
  usuario: string | User;
  fechaInicio: Date;
  fechaFin: Date;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  observaciones?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Bitacora {
  _id?: string;
  usuario: string | User;
  accion: string;
  detalles?: string;
  ip?: string;
  userAgent?: string;
  createdAt?: Date;
}

export interface Registro {
  _id?: string;
  usuario: string | User;
  ambiente: string | Ambiente;
  fechaEntrada: Date;
  fechaSalida?: Date;
  observaciones?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Tipos para requests de API
export interface CreateAmbienteRequest {
  nombre: string;
  tipo: Ambiente['tipo'];
  capacidad: number;
  ubicacion?: string;
  descripcion?: string;
  servicios: string[] | string; // Allow both string and string[]
  responsable?: string;
  equipos: number;
}

export interface UpdateAmbienteRequest extends Partial<CreateAmbienteRequest> {
  activo?: boolean;
  servicios?: string[] | string; // Explicitly allow both types
}

export interface CreateUserRequest {
  nombre: string;
  email: string;
  password: string;
  rol: User['rol'];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateReservaRequest {
  ambiente: string;
  fechaInicio: Date;
  fechaFin: Date;
  observaciones?: string;
}

// Tipos para responses de API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;  // Hacer opcional
  message?: string;
  error?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Tipos para JWT
export interface JWTPayload {
  id: string;
  email: string;
  rol: User['rol'];
  iat?: number;
  exp?: number;
}

// Tipos para middleware
export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}