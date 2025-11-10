import mongoose, { Schema, InferSchemaType } from 'mongoose';;

const ThreadSchema = new Schema(
  {
    botSlug: { type: String, index: true, required: true },
    // Anonymous local thread key generated in widget (NOT a user id)
    threadKey: { type: String, index: true, required: true },
    pageUrl: { type: String, index: true, required: true },
    messages: [
      {
        role: { type: String, enum: ['assistant', 'user'], required: true },
        text: { type: String, required: true },
        ts: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

ThreadSchema.index({ botSlug: 1, threadKey: 1, pageUrl: 1 }, { unique: true });

export type ThreadDoc = InferSchemaType<typeof ThreadSchema>;
export const Thread = mongoose.model<ThreadDoc>('Thread', ThreadSchema);
