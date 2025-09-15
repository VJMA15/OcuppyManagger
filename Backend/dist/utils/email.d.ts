interface EmailOptions {
    email: string;
    subject: string;
    message: string;
    html?: string;
}
export declare const sendEmail: (options: EmailOptions) => Promise<void>;
export declare const sendWelcomeEmail: (email: string, nombre: string) => Promise<void>;
export declare const sendPasswordResetEmail: (email: string, resetURL: string) => Promise<void>;
declare const _default: {
    sendEmail: (options: EmailOptions) => Promise<void>;
    sendWelcomeEmail: (email: string, nombre: string) => Promise<void>;
    sendPasswordResetEmail: (email: string, resetURL: string) => Promise<void>;
};
export default _default;
//# sourceMappingURL=email.d.ts.map