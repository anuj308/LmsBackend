import mongoose from "mongoose";

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000; // 5 seconds

class DatabaseConnection {
    constructor() {
        this.retryCount = 0;
        this.isConnected = false;

        mongoose.set("strictQuery", true);

        mongoose.connection.on("connected", () => {
            this.isConnected = true;
            console.log("MONGODB CONNECTED SUCCESSFULLY");
        });
        mongoose.connection.on("error", () => {
            this.isConnected = false;
            console.log("MONGODB CONNECTION ERROR");
        });
        mongoose.connection.on("disconnected", () => {
            this.isConnected = false;
            console.log("MONGODB DISCONNECTED SUCCESSFULLY");
            // attempt to reconnect
            this.handleDisconnection();
        });

        process.on("SIGTERM", this.handleAppTermination.bind(this));
    }

    async connect() {
        try {
            if (!process.env.MONGO_URI) {
                throw new Error("MONGODB URI is not defined in env variables");
            }

            const connectOptions = {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                family: 4, //use ipv4
            };

            if (!process.env.NODE_ENV === "development") {
                mongoose.set("debug", true);
            }

            await mongoose.connect(process.env.MONGO_URI, connectOptions);
            this.retryCount = 0; // reset retry count on success
        } catch (error) {
            console.error(error.message);
            await this.handleConnectionError();
        }
    }

    async handleConnectionError() {
        if (this.retryCount < MAX_RETRIES) {
            this.retryCount++;
            console.log(
                `Retrying connection... Attemp ${this.retryCount} of ${MAX_RETRIES}`
            );
            await new Promise((resolve) =>
                setTimeout(() => {
                    resolve;
                }, RETRY_INTERVAL)
            );
            return this.connect();
        } else {
            console.error(
                `Failed to connect to MONGODB after ${MAX_RETRIES} attempts`
            );
            process.exit(1);
        }
    }

    async handleDisconnection() {
        if (!this.isConnected) {
            console.log("Attempting to reconnect to MONGODB...");
            this.connect();
        }
    }

    async handleAppTermination() {
        try {
            await mongoose.connect.close();
            console.log("MongoDB connection closed through app termination");
            process.exit(0);
        } catch (error) {
            console.error("Error during database disconnection", error);
            process.exit(1);
        }
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            name: mongoose.connection.name,
        };
    }
}

// create a singleton instance

const dbConnection = new DatabaseConnection();

export default dbConnection.connect.bind(dbConnection);
export const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection);
