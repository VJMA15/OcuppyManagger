import mongoose, { Document, Schema, Model } from 'mongoose';

// Interfaz para el documento Bitacora
export interface IBitacora extends Document {
  usuario: mongoose.Types.ObjectId;
  accion: string;
  entidad: string;
  entidadId?: string;
  detalles?: string;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaz para los métodos estáticos
export interface IBitacoraModel extends Model<IBitacora> {
  registrarAccion(
    usuarioId: string,
    accion: string,
    entidad: string,
    entidadId?: string,
    detalles?: string,
    ip?: string,
    userAgent?: string
  ): Promise<IBitacora | null>;
  
  obtenerRegistros(filtros?: any): Promise<{
    registros: any[];
    total: number;
    pagina: number;
    totalPaginas: number;
  }>;
}

const bitacoraSchema = new Schema<IBitacora>({
  usuario: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'El usuario es obligatorio']
  },
  accion: {
    type: String,
    required: [true, 'La acción es obligatoria'],
    enum: [
      // Acciones de reservas
      'reserva_creada',
      'reserva_aprobada', 
      'reserva_rechazada',
      'reserva_cancelada',
      'reserva_completada',
      // Acciones de usuarios
      'usuario_creado',
      'usuario_actualizado',
      'usuario_eliminado',
      'login',
      'logout',
      // Acciones de ambientes
      'ambiente_creado',
      'ambiente_actualizado',
      'ambiente_eliminado',
      // Acciones de entregas
      'entrega_creada',
      'entrega_completada',
      'entrega_devuelta',
      'entrega_cancelada',
      // Acciones generales
      'consulta',
      'exportacion',
      'importacion',
      'configuracion_actualizada'
    ]
  },
  entidad: {
    type: String,
    required: [true, 'La entidad es obligatoria'],
    enum: ['reserva', 'usuario', 'ambiente', 'entrega', 'sistema', 'reporte']
  },
  entidadId: {
    type: String,
    required: false
  },
  detalles: {
    type: String,
    required: false,
    maxlength: [1000, 'Los detalles no pueden exceder 1000 caracteres']
  },
  ip: {
    type: String,
    required: false,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // IP es opcional
        // IPv4
        const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
        // IPv6 (incluyendo formas abreviadas como ::1)
        const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
        return ipv4Regex.test(v) || ipv6Regex.test(v);
      },
      message: 'IP inválida'
    }
  },
  userAgent: {
    type: String,
    required: false,
    maxlength: [500, 'El user agent no puede exceder 500 caracteres']
  }
}, {
  timestamps: true,
  collection: 'bitacora'
});

// Índices para mejorar el rendimiento de las consultas
bitacoraSchema.index({ usuario: 1, createdAt: -1 });
bitacoraSchema.index({ entidad: 1, entidadId: 1 });
bitacoraSchema.index({ accion: 1, createdAt: -1 });
bitacoraSchema.index({ createdAt: -1 });

// Método estático para registrar una acción
bitacoraSchema.statics.registrarAccion = async function(
  usuarioId: string,
  accion: string,
  entidad: string,
  entidadId?: string,
  detalles?: string,
  ip?: string,
  userAgent?: string
) {
  try {
    const registro = new this({
      usuario: usuarioId,
      accion,
      entidad,
      entidadId,
      detalles,
      ip,
      userAgent
    });
    
    return await registro.save();
  } catch (error) {
    console.error('Error al registrar acción en bitácora:', error);
    // No lanzar error para evitar que falle la operación principal
    return null;
  }
};

// Método estático para obtener registros con filtros
bitacoraSchema.statics.obtenerRegistros = async function(filtros = {}) {
  const {
    usuarioId,
    entidad,
    entidadId,
    accion,
    fechaInicio,
    fechaFin,
    limite = 50,
    pagina = 1
  } = filtros;

  const query: any = {};

  if (usuarioId) query.usuario = usuarioId;
  if (entidad) query.entidad = entidad;
  if (entidadId) query.entidadId = entidadId;
  if (accion) query.accion = accion;

  if (fechaInicio || fechaFin) {
    query.createdAt = {};
    if (fechaInicio) query.createdAt.$gte = new Date(fechaInicio);
    if (fechaFin) query.createdAt.$lte = new Date(fechaFin);
  }

  const skip = (pagina - 1) * limite;

  const [registros, total] = await Promise.all([
    this.find(query)
      .populate('usuario', 'nombre email cc role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limite)
      .lean(),
    this.countDocuments(query)
  ]);

  return {
    registros,
    total,
    pagina,
    totalPaginas: Math.ceil(total / limite)
  };
};

const Bitacora = mongoose.model<IBitacora, IBitacoraModel>('Bitacora', bitacoraSchema);
export default Bitacora;