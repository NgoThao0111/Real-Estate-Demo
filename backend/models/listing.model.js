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
    rental_type: {
      type: String,
      required: true,
    },
    images: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    //Tham chiếu đến người đăng
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      // required: true,
      index: true,
    },

    //Tham chiếu đến loại BĐS
    property_type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PropertyType",
      // required: true
    },

    //Nhúng địa chỉ
    location: {
      province: {
        type: String,
        required: true,
      },
      ward: {
        type: String,
        required: true,
      },
      detail: String, //số nhà, tên đường
      // Có thể mở rộng thêm tọa độ
    },

    //Mối quan hệ M-N với Utility, thêm thuộc tính amount
    amenities: [
      {
        utility: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Utility",
        },
        amount: {
          type: Number,
          default: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;
