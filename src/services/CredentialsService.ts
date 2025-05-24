import bcrypt from "bcryptjs";
export class CredentialsService {
    async comparePassword(userPassword: string, passwordHash: string) {
        return await bcrypt.compare(userPassword, passwordHash);
    }
}
