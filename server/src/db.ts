import mongoose from 'mongoose';

export async function connectDB(uri: string) {
    if (!uri) throw new Error('MONGO_URI missing');
    mongoose.set('strictQuery', true);
    return mongoose.connect(uri, { dbName: process.env.MONGO_DB || 'chat_widget' });
}

declare global {
    // handy for tests
    // eslint-disable-next-line no-var
    var __MONGOCONN__: typeof mongoose | undefined;
}