import app from "./app";
import { Config } from "./config";
import { AppDataSource } from "./config/data-source";
import logger from "./config/logger";
import { User } from "./entity/User";
import { UserService } from "./services/UserService";

const userRepository = AppDataSource.getRepository(User);
const userService = new UserService(userRepository);

const createAdminIfNotExist = async () => {
    const admin = await userRepository.findOne({
        where: { role: "ADMIN" },
    });
    if (!admin) {
        logger.info("No Admin Found...Creating default admin..");
        try {
            await userService.create({
                firstName: "Super",
                lastName: "Admin",
                email: "admin@example.com",
                password: "admin123", // You can load this from env for security
                role: "ADMIN",
                tenantId: undefined, // or null if needed
            });
            logger.info("Default Admin Created Successfully!");
        } catch (err) {
            logger.error("Failed to create admin user..", err);
        }
    } else {
        logger.info("Admin Already Exists!!");
    }
};

const startServer = async () => {
    const PORT = Config.PORT;
    try {
        await AppDataSource.initialize();
        logger.info("Database connected successfully! ");
        await createAdminIfNotExist();
        app.listen(PORT, () => {
            logger.info("Server Listening on port, ", { port: PORT });
        });
    } catch (err: unknown) {
        if (err instanceof Error) {
            logger.error(err.message);
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        }
    }
};
void startServer();
