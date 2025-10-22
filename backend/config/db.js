import mongoose from "mongoose"


const connectToDB = async() => {
    try {

        mongoose.connection.on("connected", () => console.log("Database connected"))

        await mongoose.connect(process.env.MONGO_URI)

        console.log("MongoDB connected successfully")


    } catch (error) {
        console.log("MongoDb connection failed:", error);
        process.exit(1)


    }
}


export default connectToDB;