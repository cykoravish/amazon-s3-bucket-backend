import mongoose from 'mongoose';

export async function connectToDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URL);
    } catch (err) {
        console.error(err);
    }
}