const mongoose = require("mongoose");

const EnquiryMailSchema = new mongoose.Schema(
  {
    propertyAdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PropertyAd",
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("EnquiryMail", EnquiryMailSchema);
