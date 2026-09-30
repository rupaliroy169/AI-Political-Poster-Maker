import mongoose, { Document, Schema } from "mongoose";

export interface ITemplate extends Document {
  name: string;
  occasion: string;
  description: string;
  previewImage: string;
  layout: Record<string, any>;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const templateSchema = new Schema<ITemplate>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    occasion: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    previewImage: {
      type: String,
      required: true,
      trim: true,
    },
    layout: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Template = mongoose.model<ITemplate>("Template", templateSchema);

export default Template;
