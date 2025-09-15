import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/index';
export declare const crearEntrega: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const obtenerEntregas: (req: Request, res: Response) => Promise<void>;
export declare const obtenerEntregaPorId: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const devolverEntrega: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const cancelarEntrega: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const obtenerEntregasPorJornada: (req: Request, res: Response) => Promise<void>;
export declare const obtenerEntregasVencidas: (req: Request, res: Response) => Promise<void>;
export declare const obtenerEstadisticasEntregas: (req: Request, res: Response) => Promise<void>;
export declare const verificarEntregaPorCodigo: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=entrega.controller.d.ts.map