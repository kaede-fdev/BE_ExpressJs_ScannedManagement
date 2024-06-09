import { seedAdminUser } from "./adminSeeding";
import { seedBanData } from "./banSeeding";

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        mongoose.set('strictQuery', false);
        const connect = await mongoose.connect(process.env.DB_URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        });
        console.log('Database connect succesfully !');
        await seedAdminUser();
        await seedBanData();
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

module.exports = { connectDB };
