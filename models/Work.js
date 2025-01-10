const mongoose = require("mongoose");
const { Schema } = mongoose;
const WorkSchema = new Schema({
  title: {
    type: String,
  },
  content: {
    type: String,
  },
  imageUrl: {
    public_id: { type: String },
    secure_url: { type: String },
    format: { type: String },
  },
});

const WorkModel = mongoose.model("Work", WorkSchema);

module.exports = WorkModel;
