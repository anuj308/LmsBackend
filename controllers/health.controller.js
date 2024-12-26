import { getDBStatus } from "../database/db.js";

export const checkHealth = async (req, res) => {
    try {
        const dbStatus = getDBStatus();

        const healthStatus = {
            status: "OK",
            timeStamp: new Date().toISOString(),
            services: {
                database: {
                    status: dbStatus.isConnected ? "healthy" : "unhealthy",
                    details: {
                        ...dbStatus,
                        readyStatus: getReadyStateText(dbStatus.readyStatus),
                    },
                },
                server: {
                    status: "healthy",
                    uptime: process.uptime(),
                    memoryUsage: process.memoryUsage(),
                },
            },
        };

        const httpStatus =
            healthStatus.services.database.status === "healthy" ? 200 : 503;

        res.status(httpStatus).json(healthStatus);
    } catch (error) {
        console.error("Health check failed", error);
        res.status(500).json({
            status: "Error",
            timeStamp: new Date(),
            error: error.message,
        });
    }
};

// utility method
function getReadyStateText(state) {
    switch (state) {
        case 0:
            return "disconnected";
        case 1:
            return "connected";
        case 2:
            return "connecting";
        case 3:
            return "disconnecting";
        default:
            return "unknow";
    }
}
