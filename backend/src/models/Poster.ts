import mongoose, { Document, Schema, Types } from "mongoose";

export interface IPoster extends Document {
  user: Types.ObjectId;
  template: Types.ObjectId;
  name: string;
  designation: string;
  party: string;
  unionOrThana: string;
  district: string;
  occasion: string;
  headline: string;
  photos: string[];
  generatedImageUrl: string;
  status: "draft" | "generated";
  createdAt?: Date;
  updatedAt?: Date;
}

const posterSchema = new Schema<IPoster>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    template: {
      type: Schema.Types.ObjectId,
      ref: "Template",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
    },
    party: {
      type: String,
      required: true,
      trim: true,
    },
    unionOrThana: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    occasion: {
      type: String,
      required: true,
      trim: true,
    },
    headline: {
      type: String,
      required: true,
      trim: true,
    },
    photos: {
      type: [String],
      default: [],
      validate: {
        validator: function (val: string[]) {
          return val.length <= 3;
        },
        message: "A poster cannot have more than 3 photos.",
      },
    },
    generatedImageUrl: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["draft", "generated"],
      default: "draft",
    },
  },
  {
    timestamps: true,
  }
);

const Poster = mongoose.model<IPoster>("Poster", posterSchema);

export default Poster;
