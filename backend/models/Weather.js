import mongoose from "mongoose"

const weatherSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: true,
    },
    temperature: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    humidity: {
      type: Number,
    },
    windSpeed: {
      type: Number,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model("Weather", weatherSchema)
