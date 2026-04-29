import mongoose from "mongoose";

const database = async () => {
  try {
    const conn = await mongoose.connect(process.env.URL);

    console.log("Database connected successfully:", conn.connection.host);
  } catch (error) {
    console.log("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export { database };