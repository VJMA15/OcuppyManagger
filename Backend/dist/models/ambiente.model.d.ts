import mongoose, { Document } from 'mongoose';
import { Ambiente } from '../types/index';
export interface AmbienteDocument extends Omit<Ambiente, '_id'>, Document {
}
declare const _default: mongoose.Model<AmbienteDocument, {}, {}, {}, mongoose.Document<unknown, {}, AmbienteDocument, {}> & AmbienteDocument & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=ambiente.model.d.ts.map