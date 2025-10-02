import { Request, Response } from 'express';
export declare class ReservationController {
    private reservationService;
    createReservation(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getReservations(req: Request, res: Response): Promise<void>;
    getMyReservations(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    approveReservation(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    rejectReservation(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    private buildFilters;
}
//# sourceMappingURL=reservation.controller.d.ts.map