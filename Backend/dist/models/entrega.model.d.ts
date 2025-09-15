import mongoose, { Document } from 'mongoose';
export interface IEntrega extends Document {
    ambiente: mongoose.Types.ObjectId;
    instructor: mongoose.Types.ObjectId;
    guardia: mongoose.Types.ObjectId;
    fechaEntrega: Date;
    horaEntrega: string;
    jornada: 'mañana' | 'tarde' | 'noche';
    estado: 'pendiente' | 'entregado' | 'devuelto' | 'cancelado';
    fechaDevolucion?: Date;
    horaDevolucion?: string;
    guardiaDevolucion?: mongoose.Types.ObjectId;
    observacionesEntrega?: string;
    observacionesDevolucion?: string;
    equiposEntregados: Array<{
        nombre: string;
        cantidad: number;
        estado: string;
    }>;
    codigoVerificacion: string;
    activo: boolean;
    duracionEntrega?: number;
    estaVencida?: boolean;
    marcarComoEntregado(): Promise<IEntrega>;
    marcarComoDevuelto(guardiaId: string, observaciones?: string): Promise<IEntrega>;
    cancelarEntrega(motivo?: string): Promise<IEntrega>;
}
export interface IEntregaModel extends mongoose.Model<IEntrega> {
    obtenerEntregasPorJornada(jornada: string, fecha?: Date): Promise<IEntrega[]>;
    obtenerEntregasVencidas(): Promise<IEntrega[]>;
    obtenerEstadisticasEntregas(fechaInicio: Date, fechaFin: Date): Promise<any[]>;
}
declare const Entrega: IEntregaModel;
export default Entrega;
//# sourceMappingURL=entrega.model.d.ts.map