import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    area: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    property_type: {
      type: String,
      required: true,
    },
    rental_type: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
    },
    address: {
      city: {
        type: String,
        required: true,
      },
      ward: {
        type: String,
        required: true,
      },
      detail: {
        type: String,
        required: true,
      },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
