import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hash this in production!
  watching: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
  planToWatch: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
  watched: [{ type: mongoose.Schema.Types.ObjectId, ref: "Item" }],
});

const ItemSchema = new mongoose.Schema({
  title: String,
  type: { type: String, enum: ["anime", "movie"] },
  synopsis: String,
  rating: Number,
});

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
export const Item = mongoose.models.Item || mongoose.model("Item", ItemSchema);