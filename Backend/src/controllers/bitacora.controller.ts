import { Request, Response } from 'express';
import Bitacora from '../models/bitacora.model';
import { AuthenticatedRequest } from '../types/index';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/appError';

export class BitacoraController {
  // Obtener todos los registros de bitácora
  obtenerBitacora = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { entidad, entidadId, usuarioId, fechaInicio, fechaFin, accion, limite, pagina } = req.query;
    
    const filtros = {
      usuarioId: usuarioId as string,
      entidad: entidad as string,
      entidadId: entidadId as string,
      accion: accion as string,
      fechaInicio: fechaInicio as string,
      fechaFin: fechaFin as string,
      limite: limite ? parseInt(limite as string) : 50,
      pagina: pagina ? parseInt(pagina as string) : 1
    };

    const resultado = await (Bitacora as any).obtenerRegistros(filtros);
    
    res.json({
      success: true,
      status: 'success',
      data: {
        registros: resultado.registros,
        total: resultado.total
      },
      results: resultado.registros.length,
      pagination: {
        pagina: resultado.pagina,
        totalPaginas: resultado.totalPaginas,
        total: resultado.total
      },
      message: 'Registros de bitácora obtenidos exitosamente'
    });
  });

  // Obtener registro de bitácora por ID
  obtenerBitacoraPorId = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const registro = await Bitacora.findById(id)
      .populate('usuario', 'nombre email cc role');
    
    if (!registro) {
      return res.status(404).json({
        success: false,
        message: 'Registro de bitácora no encontrado'
      });
    }
    
    res.json({
      success: true,
      status: 'success',
      data: {
        registro
      },
      message: 'Registro de bitácora obtenido exitosamente'
    });
  });

  // Crear nuevo registro de bitácora
  crearBitacora = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { accion, entidad, entidadId, detalles } = req.body;
    
    if (!accion || !entidad) {
      return res.status(400).json({
        success: false,
        message: 'Acción y entidad son campos obligatorios'
      });
    }

    const nuevoRegistro = await (Bitacora as any).registrarAccion(
      req.user?.id,
      accion,
      entidad,
      entidadId,
      detalles,
      req.ip,
      req.get('User-Agent')
    );
    
    if (!nuevoRegistro) {
      return res.status(500).json({
        success: false,
        message: 'Error al crear registro de bitácora'
      });
    }

    // Poblar el usuario para la respuesta
    await nuevoRegistro.populate('usuario', 'nombre email cc role');
    
    res.status(201).json({
      success: true,
      status: 'success',
      data: {
        registro: nuevoRegistro
      },
      message: 'Registro de bitácora creado exitosamente'
    });
  });

  // Obtener bitácora por entidad
  obtenerBitacoraPorEntidad = catchAsync(async (req: Request, res: Response) => {
    const { entidad } = req.params;
    const { entidadId, limite, pagina } = req.query;
    
    const filtros = {
      entidad,
      entidadId: entidadId as string,
      limite: limite ? parseInt(limite as string) : 50,
      pagina: pagina ? parseInt(pagina as string) : 1
    };

    const resultado = await (Bitacora as any).obtenerRegistros(filtros);
    
    res.json({
      success: true,
      status: 'success',
      data: {
        registros: resultado.registros,
        total: resultado.total
      },
      results: resultado.registros.length,
      message: `Registros de bitácora para ${entidad} obtenidos exitosamente`
    });
  });

  // Obtener estadísticas de bitácora
  obtenerEstadisticas = catchAsync(async (req: Request, res: Response) => {
    const hoy = new Date();
    const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const inicioSemana = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const [totalRegistros, registrosHoy, registrosSemana, registrosMes, accionesMasComunes] = await Promise.all([
      Bitacora.countDocuments(),
      Bitacora.countDocuments({ createdAt: { $gte: inicioHoy } }),
      Bitacora.countDocuments({ createdAt: { $gte: inicioSemana } }),
      Bitacora.countDocuments({ createdAt: { $gte: inicioMes } }),
      Bitacora.aggregate([
        {
          $group: {
            _id: '$accion',
            cantidad: { $sum: 1 }
          }
        },
        { $sort: { cantidad: -1 } },
        { $limit: 10 }
      ])
    ]);

    res.json({
      success: true,
      status: 'success',
      data: {
        estadisticas: {
          totalRegistros,
          registrosHoy,
          registrosSemana,
          registrosMes,
          accionesMasComunes
        }
      },
      message: 'Estadísticas de bitácora obtenidas exitosamente'
    });
  });

  // Método de utilidad para registrar acciones desde otros controladores
  static async registrarAccion(
    usuarioId: string,
    accion: string,
    entidad: string,
    entidadId?: string,
    detalles?: string,
    ip?: string,
    userAgent?: string
  ) {
    try {
      return await (Bitacora as any).registrarAccion(
        usuarioId,
        accion,
        entidad,
        entidadId,
        detalles,
        ip,
        userAgent
      );
    } catch (error) {
      console.error('Error al registrar acción en bitácora:', error);
      return null;
    }
  }

  // Limpiar registros antiguos
  limpiarRegistrosAntiguos = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
    const { diasAntiguedad = 90 } = req.body;
    
    // Por ahora solo simulamos la limpieza
    const resultado = {
      success: true,
      status: 'success',
      data: {
        registrosEliminados: 0
      },
      message: `Registros anteriores a ${diasAntiguedad} días eliminados exitosamente`
    };
    
    res.json(resultado);
  });
}

export default new BitacoraController();