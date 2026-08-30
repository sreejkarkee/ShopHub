
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URL);
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`MongoDB connection error: ${err.message}`);
        process.exit(1); // exit process with failure
    }
};

module.exports = connectDB;