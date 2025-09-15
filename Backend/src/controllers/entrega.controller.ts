import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import Entrega from '../models/entrega.model';
import Ambiente from '../models/ambiente.model';
import User from '../models/user.model';
import { AuthenticatedRequest } from '../types/index';

// Crear nueva entrega
export const crearEntrega = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validar errores de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Datos de entrada inválidos',
        errors: errors.array()
      });
    }

    const {
      ambiente,
      instructor,
      jornada,
      observacionesEntrega,
      equiposEntregados
    } = req.body;

    // Verificar que el ambiente existe
    const ambienteExiste = await Ambiente.findById(ambiente);
    if (!ambienteExiste) {
      return res.status(404).json({
        success: false,
        message: 'Ambiente no encontrado'
      });
    }

    // Verificar que el instructor existe
    const instructorExiste = await User.findById(instructor);
    if (!instructorExiste || instructorExiste.role !== 'instructor') {
      return res.status(404).json({
        success: false,
        message: 'Instructor no encontrado o rol inválido'
      });
    }

    // Verificar que no existe una entrega activa para este ambiente en esta jornada
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);

    const entregaExistente = await Entrega.findOne({
      ambiente,
      jornada,
      fechaEntrega: {
        $gte: hoy,
        $lt: mañana
      },
      estado: { $in: ['pendiente', 'entregado'] },
      activo: true
    });

    if (entregaExistente) {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una entrega activa para este ambiente en esta jornada'
      });
    }

    // Crear la entrega
    const nuevaEntrega = new Entrega({
      ambiente,
      instructor,
      guardia: req.user?.id,
      jornada,
      fechaEntrega: new Date(),
      horaEntrega: new Date().toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      observacionesEntrega,
      equiposEntregados: equiposEntregados || [],
      estado: 'entregado' // Se marca como entregado inmediatamente
    });

    await nuevaEntrega.save();

    res.status(201).json({
      success: true,
      message: 'Entrega registrada exitosamente',
      data: nuevaEntrega
    });

  } catch (error: any) {
    console.error('Error al crear entrega:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todas las entregas con filtros
export const obtenerEntregas = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 10,
      estado,
      jornada,
      instructor,
      ambiente,
      fechaInicio,
      fechaFin,
      search,
      guardia
    } = req.query;

    // Construir filtros
    const filtros: any = { activo: true };

    if (estado) filtros.estado = estado;
    if (jornada) filtros.jornada = jornada;
    if (instructor) filtros.instructor = instructor;
    if (ambiente) filtros.ambiente = ambiente;
    if (guardia) filtros.guardia = guardia;

    // Filtro por fechas
    if (fechaInicio || fechaFin) {
      filtros.fechaEntrega = {};
      if (fechaInicio) filtros.fechaEntrega.$gte = new Date(fechaInicio as string);
      if (fechaFin) filtros.fechaEntrega.$lte = new Date(fechaFin as string);
    }

    // Filtro de búsqueda
    if (search) {
      filtros.$or = [
        { observacionesEntrega: { $regex: search, $options: 'i' } },
        { observacionesDevolucion: { $regex: search, $options: 'i' } },
        { codigoVerificacion: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const [entregas, total] = await Promise.all([
      Entrega.find(filtros)
        .sort({ fechaEntrega: -1 })
        .skip(skip)
        .limit(limitNum),
      Entrega.countDocuments(filtros)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: entregas,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: totalPages
      }
    });

  } catch (error: any) {
    console.error('Error al obtener entregas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener entrega por ID
export const obtenerEntregaPorId = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de entrega inválido'
      });
    }

    const entrega = await Entrega.findById(id);

    if (!entrega || !entrega.activo) {
      return res.status(404).json({
        success: false,
        message: 'Entrega no encontrada'
      });
    }

    res.json({
      success: true,
      data: entrega
    });

  } catch (error: any) {
    console.error('Error al obtener entrega:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Marcar entrega como devuelta
export const devolverEntrega = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { observacionesDevolucion } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de entrega inválido'
      });
    }

    const entrega = await Entrega.findById(id);

    if (!entrega || !entrega.activo) {
      return res.status(404).json({
        success: false,
        message: 'Entrega no encontrada'
      });
    }

    if (entrega.estado !== 'entregado') {
      return res.status(400).json({
        success: false,
        message: 'Solo se pueden devolver entregas que estén en estado "entregado"'
      });
    }

    await entrega.marcarComoDevuelto(req.user!.id, observacionesDevolucion);

    res.json({
      success: true,
      message: 'Entrega marcada como devuelta exitosamente',
      data: entrega
    });

  } catch (error: any) {
    console.error('Error al devolver entrega:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Cancelar entrega
export const cancelarEntrega = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de entrega inválido'
      });
    }

    const entrega = await Entrega.findById(id);

    if (!entrega || !entrega.activo) {
      return res.status(404).json({
        success: false,
        message: 'Entrega no encontrada'
      });
    }

    if (entrega.estado === 'devuelto' || entrega.estado === 'cancelado') {
      return res.status(400).json({
        success: false,
        message: 'No se puede cancelar una entrega que ya está devuelta o cancelada'
      });
    }

    await entrega.cancelarEntrega(motivo);

    res.json({
      success: true,
      message: 'Entrega cancelada exitosamente',
      data: entrega
    });

  } catch (error: any) {
    console.error('Error al cancelar entrega:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener entregas por jornada
export const obtenerEntregasPorJornada = async (req: Request, res: Response) => {
  try {
    const { jornada } = req.params;
    const { fecha } = req.query;

    const fechaConsulta = fecha ? new Date(fecha as string) : new Date();
    const entregas = await Entrega.obtenerEntregasPorJornada(jornada, fechaConsulta);

    res.json({
      success: true,
      data: entregas,
      meta: {
        jornada,
        fecha: fechaConsulta.toISOString().split('T')[0],
        total: entregas.length
      }
    });

  } catch (error: any) {
    console.error('Error al obtener entregas por jornada:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener entregas vencidas
export const obtenerEntregasVencidas = async (req: Request, res: Response) => {
  try {
    const entregas = await Entrega.obtenerEntregasVencidas();

    res.json({
      success: true,
      data: entregas,
      meta: {
        total: entregas.length,
        mensaje: 'Entregas con más de 8 horas sin devolver'
      }
    });

  } catch (error: any) {
    console.error('Error al obtener entregas vencidas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener estadísticas de entregas
export const obtenerEstadisticasEntregas = async (req: Request, res: Response) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    
    // Fechas por defecto: último mes
    const fin = fechaFin ? new Date(fechaFin as string) : new Date();
    const inicio = fechaInicio ? new Date(fechaInicio as string) : new Date(fin.getTime() - 30 * 24 * 60 * 60 * 1000);

    const estadisticas = await Entrega.obtenerEstadisticasEntregas(inicio, fin);

    // Obtener estadísticas adicionales
    const totalEntregas = await Entrega.countDocuments({
      fechaEntrega: { $gte: inicio, $lte: fin },
      activo: true
    });

    const entregasVencidas = await Entrega.countDocuments({
      estado: 'entregado',
      fechaEntrega: { 
        $gte: inicio, 
        $lte: fin,
        $lt: new Date(Date.now() - 8 * 60 * 60 * 1000) // Más de 8 horas
      },
      activo: true
    });

    const promedioTiempoDevolucion = await Entrega.aggregate([
      {
        $match: {
          estado: 'devuelto',
          fechaEntrega: { $gte: inicio, $lte: fin },
          fechaDevolucion: { $exists: true },
          activo: true
        }
      },
      {
        $project: {
          tiempoDevolucion: {
            $divide: [
              { $subtract: ['$fechaDevolucion', '$fechaEntrega'] },
              1000 * 60 * 60 // Convertir a horas
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          promedioHoras: { $avg: '$tiempoDevolucion' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        estadisticasPorEstado: estadisticas,
        resumen: {
          totalEntregas,
          entregasVencidas,
          promedioTiempoDevolucion: promedioTiempoDevolucion[0]?.promedioHoras || 0
        },
        periodo: {
          inicio: inicio.toISOString().split('T')[0],
          fin: fin.toISOString().split('T')[0]
        }
      }
    });

  } catch (error: any) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Verificar entrega por código
export const verificarEntregaPorCodigo = async (req: Request, res: Response) => {
  try {
    const { codigo } = req.params;

    const entrega = await Entrega.findOne({
      codigoVerificacion: codigo.toUpperCase(),
      activo: true
    });

    if (!entrega) {
      return res.status(404).json({
        success: false,
        message: 'Código de verificación no encontrado'
      });
    }

    res.json({
      success: true,
      data: {
        entrega: {
          _id: entrega._id,
          ambiente: entrega.ambiente,
          instructor: entrega.instructor,
          estado: entrega.estado,
          fechaEntrega: entrega.fechaEntrega,
          horaEntrega: entrega.horaEntrega,
          jornada: entrega.jornada,
          codigoVerificacion: entrega.codigoVerificacion
        }
      }
    });

  } catch (error: any) {
    console.error('Error al verificar código:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};