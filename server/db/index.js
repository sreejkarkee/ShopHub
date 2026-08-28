
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // these options are defaults in mongoose 6+, so usually not needed
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1); // exit process with failure
  }
};

module.exports = connectDB;