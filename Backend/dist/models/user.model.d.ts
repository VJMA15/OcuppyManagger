import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    nombre: string;
    cc: string;
    email: string;
    password: string;
    passwordChangedAt?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    role: 'admin' | 'instructor' | 'guardia';
    activo: boolean;
    createdAt: Date;
    updatedAt: Date;
    compararPassword(candidatePassword: string): Promise<boolean>;
    cambioPassword(JWTTimestamp: number): boolean;
    createPasswordResetToken(): string;
}
declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}> & IUser & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default User;
//# sourceMappingURL=user.model.d.ts.map