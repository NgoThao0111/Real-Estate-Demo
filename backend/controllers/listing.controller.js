import Listing from "../models/listing.model.js";
import { uploadBuffer } from "../utils/uploadToCloudinary.js";

export const createList = async (req, res) => {
  if (!req.session || !req.session.user || !req.session.user.id) {
    return res.status(401).json({
      message: "Unauthorized: User not logged in",
    });
  }

  try {
    const ownerId = req.session.user.id;

    const {
      title,
      description,
      area,
      price,
      status,
      property_type,
      rental_type,
      location,
      amenities
    } = req.body;
    const province = location?.province;
    const ward = location?.ward;
    const detail = location?.detail;
    const validAmenities = Array.isArray(amenities) ? amenities: [];

    if (
      !title ||
      !area ||
      !price ||
      !status ||
      !property_type ||
      !rental_type ||
      !province ||
      !ward ||
      !detail
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let images = [];
    if (req.body.images) {
      if (Array.isArray(req.body.images)) images = req.body.images;
      else if (typeof req.body.images === "string")
        images = req.body.images
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
    }

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const uploaded = await uploadBuffer(file.buffer, "listings");
          if (uploaded && (uploaded.secure_url || uploaded.url)) {
            images.push(uploaded.secure_url || uploaded.url);
          }
        } catch (err) {
          console.error("Cloudinary upload error:", err);
          // continue uploading other files; do not fail entire request for single image
        }
      }
    }

    const list = new Listing({
      title: title,
      description: description,
      area: area,
      price: price,
      status: status,
      property_type: property_type,
      rental_type: rental_type,
      images: images,
      owner: ownerId,
      location: {
        province: province,
        ward: ward,
        detail: detail,
      },
      amenities: validAmenities,
    });

    await list.save();

    return res.status(201).json({
      message: "Create List Successfully",
      listing: list,
    });
  } catch (error) {
    console.log(error.message);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Validation failed: " + error.message,
      });
    }

    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

export const getListings = async (req, res) => {
  try {
    const {
      search,
      province,
      property_type,
      rental_type,
      status,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      page = 1,
      limit = 30,
      sort,
    } = req.query;

    const query = {};

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ title: regex }, { description: regex }];
    }

    if (province) query["location.province"] = province;
    if (property_type) query.property_type = property_type;
    if (rental_type) query.rental_type = rental_type;
    if (status) query.status = status;

    const minP = minPrice !== undefined ? Number(minPrice) : undefined;
    const maxP = maxPrice !== undefined ? Number(maxPrice) : undefined;
    const minA = minArea !== undefined ? Number(minArea) : undefined;
    const maxA = maxArea !== undefined ? Number(maxArea) : undefined;

    if (
      (minPrice !== undefined && isNaN(minP)) ||
      (maxPrice !== undefined && isNaN(maxP))
    ) {
      return res
        .status(400)
        .json({ message: "minPrice and maxPrice must be numbers" });
    }
    if (
      (minArea !== undefined && isNaN(minA)) ||
      (maxArea !== undefined && isNaN(maxA))
    ) {
      return res
        .status(400)
        .json({ message: "minArea and maxArea must be numbers" });
    }

    if (minP !== undefined || maxP !== undefined) {
      query.price = {};
      if (minP !== undefined) query.price.$gte = minP;
      if (maxP !== undefined) query.price.$lte = maxP;
    }
    if (minA !== undefined || maxA !== undefined) {
      query.area = {};
      if (minA !== undefined) query.area.$gte = minA;
      if (maxA !== undefined) query.area.$lte = maxA;
    }

    const pageNum = Math.max(1, Number(page));
    const lim = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * lim;

    let sortObj = { createdAt: -1 };
    if (sort) {
      if (sort === "price_asc") sortObj = { price: 1 };
      else if (sort === "price_desc") sortObj = { price: -1 };
      else if (sort === "area_asc") sortObj = { area: 1 };
      else if (sort === "area_desc") sortObj = { area: -1 };
      else if (sort === "oldest") sortObj = { createdAt: 1 };
    }

    const listings = await Listing.find(query)
      .sort(sortObj)
      .skip(skip)
      .limit(lim);

    if (!listings || listings.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy tin đăng nào phù hợp",
        listings: [],
      });
    }

    return res.json({
      message: "Lấy danh sách tin đăng thành công",
      listings,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const getListingById = async (req, res) => {
  try {
    const id = req.params.id;
    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ message: "Not Found" });
    return res.json(listing);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get listings created by current logged-in user
export const getMyListings = async (req, res) => {
  try {
    if (!req.session || !req.session.user)
      return res.status(401).json({ message: "Vui lòng đăng nhập" });

    const userId = req.session.user.id;
    const listings = await Listing.find({ owner: userId }).sort({
      createdAt: -1,
    });

    return res.json({ message: "Lấy bài đăng của tôi thành công", listings });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateListing = async (req, res) => {
  try {
    if (!req.session || !req.session.user)
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    const userId = req.session.user.id;
    const id = req.params.id;

    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (
      !listing.owner ||
      listing.owner.toString() !== userId.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền chỉnh sửa bài đăng này" });
    }

    const update = { ...req.body };
    let bodyImages = [];
    if (req.body.images) {
      if (Array.isArray(req.body.images)) bodyImages = req.body.images;
      else if (typeof req.body.images === "string")
        bodyImages = req.body.images
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
    }

    // If files uploaded, upload them to Cloudinary and append to images
    const uploadedImages = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const uploaded = await uploadBuffer(file.buffer, "listings");
          if (uploaded && (uploaded.secure_url || uploaded.url)) {
            uploadedImages.push(uploaded.secure_url || uploaded.url);
          }
        } catch (err) {
          console.error("Cloudinary upload error on update:", err);
        }
      }
    }

    if (bodyImages.length > 0 || uploadedImages.length > 0) {
      update.images = [...bodyImages, ...uploadedImages];
    }

    const updated = await Listing.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true }
    );
    return res.json({ message: "Cập nhật thành công", listing: updated });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const id = req.params.id;

    const deleted = await Listing.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        message: "Not Found",
      });
    }

    return res.json({
      message: "Tin đăng được xóa thành công",
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};
