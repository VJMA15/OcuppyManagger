export interface Reservation {
  id: string;
  userId: string;
  environmentId: string;
  startDate: Date;
  endDate: Date;
  status: ReservationStatus;
  purpose: string;
  equipment: Equipment[];
  createdAt: Date;
  updatedAt: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

export enum ReservationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export interface Equipment {
  type: EquipmentType;
  quantity: number;
}

export enum EquipmentType {
  PROJECTOR = 'projector',
  COMPUTER = 'computer',
  SOUND_SYSTEM = 'sound_system',
  MICROPHONE = 'microphone',
  VIDEO_BEAM = 'video_beam',
  DIGITAL_BOARD = 'digital_board'
}