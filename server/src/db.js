import mongoose from 'mongoose';

export async function connectDB(uri) {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, { dbName: 'poc_mern_mui_chatbot' });
    console.log('MongoDB connected');
}
