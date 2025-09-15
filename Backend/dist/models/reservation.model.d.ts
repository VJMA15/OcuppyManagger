import { Schema, Document } from 'mongoose';
declare enum ReservationStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED"
}
declare enum EquipmentType {
    PROJECTOR = "PROJECTOR",
    MICROPHONE = "MICROPHONE",
    COMPUTER = "COMPUTER",
    WHITEBOARD = "WHITEBOARD"
}
interface Reservation {
    userId: Schema.Types.ObjectId;
    environmentId: Schema.Types.ObjectId;
    startDate: Date;
    endDate: Date;
    status: ReservationStatus;
    purpose: string;
    equipment?: Array<{
        type: EquipmentType;
        quantity: number;
    }>;
    approvedBy?: Schema.Types.ObjectId;
    approvedAt?: Date;
    rejectionReason?: string;
}
export declare const ReservationModel: import("mongoose").Model<Reservation & Document<unknown, any, any, Record<string, any>>, {}, {}, {}, Document<unknown, {}, Reservation & Document<unknown, any, any, Record<string, any>>, {}> & Reservation & Document<unknown, any, any, Record<string, any>> & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export {};
//# sourceMappingURL=reservation.model.d.ts.map