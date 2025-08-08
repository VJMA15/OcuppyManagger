import { Request, Response } from 'express';
// Cambiar línea 2 de:
// import { Ambiente, CreateAmbienteRequest, UpdateAmbienteRequest } from '../types';

// Por:
import { Ambiente, CreateAmbienteRequest, UpdateAmbienteRequest } from '../types/index';
import AmbienteModel from '../models/ambiente.model';

// Tipo simplificado para respuestas
interface SimpleResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export const crearAmbiente = async (req: Request, res: Response): Promise<void> => {
  try {
    const ambienteData = {
      ...req.body,
      capacidad: parseInt(req.body.capacidad.toString()),
      equipos: parseInt(req.body.equipos.toString()),
      servicios: Array.isArray(req.body.servicios) 
        ? req.body.servicios 
        : (req.body.servicios as string).split(',').map((s: string) => s.trim())
    };

    const ambiente = new AmbienteModel(ambienteData);
    await ambiente.save();
    
    const response: SimpleResponse = {
      success: true,
      data: ambiente.toObject(),
      message: 'Ambiente creado exitosamente'
    };
    res.status(201).json(response);
  } catch (error: any) {
    const response: SimpleResponse = {
      success: false,
      error: error.message
    };
    res.status(400).json(response);
  }
};

export const obtenerAmbientes = async (req: Request, res: Response): Promise<void> => {
  try {
    const ambientes = await AmbienteModel.find();
    const response: SimpleResponse = {
      success: true,
      data: ambientes
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: SimpleResponse = {
      success: false,
      error: error.message
    };
    res.status(500).json(response);
  }
};

export const obtenerAmbiente = async (req: Request, res: Response): Promise<void> => {
  try {
    const ambiente = await AmbienteModel.findById(req.params.id);
    if (!ambiente) {
      const response: SimpleResponse = {
        success: false,
        error: 'Ambiente no encontrado'
      };
      res.status(404).json(response);
      return;
    }
    const response: SimpleResponse = {
      success: true,
      data: ambiente
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: SimpleResponse = {
      success: false,
      error: error.message
    };
    res.status(500).json(response);
  }
};

export const actualizarAmbiente = async (req: Request, res: Response): Promise<void> => {
  try {
    const ambienteData = {
      ...req.body,
      capacidad: parseInt(req.body.capacidad.toString()),
      equipos: parseInt(req.body.equipos.toString()),
      servicios: Array.isArray(req.body.servicios) 
        ? req.body.servicios 
        : (req.body.servicios as string).split(',').map((s: string) => s.trim())
    };

    const ambiente = await AmbienteModel.findByIdAndUpdate(
      req.params.id,
      ambienteData,
      { new: true, runValidators: true }
    );

    if (!ambiente) {
      const response: SimpleResponse = {
        success: false,
        error: 'Ambiente no encontrado'
      };
      res.status(404).json(response);
      return;
    }

    const response: SimpleResponse = {
      success: true,
      data: ambiente,
      message: 'Ambiente actualizado exitosamente'
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: SimpleResponse = {
      success: false,
      error: error.message
    };
    res.status(400).json(response);
  }
};

export const eliminarAmbiente = async (req: Request, res: Response): Promise<void> => {
  try {
    const ambiente = await AmbienteModel.findByIdAndDelete(req.params.id);
    if (!ambiente) {
      const response: SimpleResponse = {
        success: false,
        error: 'Ambiente no encontrado'
      };
      res.status(404).json(response);
      return;
    }
    const response: SimpleResponse = {
      success: true,
      message: 'Ambiente eliminado exitosamente'
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: SimpleResponse = {
      success: false,
      error: error.message
    };
    res.status(500).json(response);
  }
};

export const verificarDisponibilidad = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ambienteId, fechaInicio, fechaFin } = req.body;
    
    // Aquí deberías implementar la lógica para verificar disponibilidad
    // Por ejemplo, consultar reservas existentes en el rango de fechas
    
    const response: SimpleResponse = {
      success: true,
      data: true, // true si está disponible, false si no
      message: 'Verificación de disponibilidad completada'
    };
    res.status(200).json(response);
  } catch (error: any) {
    const response: SimpleResponse = {
      success: false,
      error: error.message
    };
    res.status(500).json(response);
  }
};