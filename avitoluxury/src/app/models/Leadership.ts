import mongoose, { Schema, Document } from 'mongoose';

export interface ILeadership extends Document {
  name: string;
  title: string;
  position: string;
  image: string;
  bio: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadershipSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide leader name'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide leader title'],
      trim: true,
    },
    position: {
      type: String,
      required: [true, 'Please provide leader position'],
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Please provide leader image'],
    },
    bio: {
      type: String,
      required: [true, 'Please provide leader bio'],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Leadership || mongoose.model<ILeadership>('Leadership', LeadershipSchema); 