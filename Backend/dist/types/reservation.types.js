"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EquipmentType = exports.ReservationStatus = void 0;
var ReservationStatus;
(function (ReservationStatus) {
    ReservationStatus["PENDING"] = "pending";
    ReservationStatus["APPROVED"] = "approved";
    ReservationStatus["REJECTED"] = "rejected";
    ReservationStatus["CANCELLED"] = "cancelled";
    ReservationStatus["COMPLETED"] = "completed";
})(ReservationStatus || (exports.ReservationStatus = ReservationStatus = {}));
var EquipmentType;
(function (EquipmentType) {
    EquipmentType["PROJECTOR"] = "projector";
    EquipmentType["COMPUTER"] = "computer";
    EquipmentType["SOUND_SYSTEM"] = "sound_system";
    EquipmentType["MICROPHONE"] = "microphone";
    EquipmentType["VIDEO_BEAM"] = "video_beam";
    EquipmentType["DIGITAL_BOARD"] = "digital_board";
})(EquipmentType || (exports.EquipmentType = EquipmentType = {}));
//# sourceMappingURL=reservation.types.js.map