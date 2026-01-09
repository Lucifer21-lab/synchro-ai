import mongoose, { Connection } from "mongoose";

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL, {
            // useNewUrlParser : true,
            // useUnifiedTopology: true
        })

        console.log(`MONGODB CONNECTED SUCCESSFULLY : ${conn.connection.host}`);

        mongoose.connection.on('error', (err) => {
            console.error("MONGODB connection error: ", err)
        });

        mongoose.connection.on('disconnected', () => {
            console.log("MONGODB DISCONNECTED");
        });
    }
    catch (error) {
        console.log("Error while connecting the MONGODB: ", error);
        process.exit(1);
    }
}

module.exports = connectDB;