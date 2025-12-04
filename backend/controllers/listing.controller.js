import mongoose from "mongoose";
import Listing from "../models/listing.model.js";
import cloudinary from "../config/cloudinary.js";

export const createList = async (req, res) => {
  if (!req.session || !req.session.user || !req.session.user.id) {
    return res.status(401).json({
      message: "Unauthorized: User not logged in",
    });
  }

  try {
    const ownerId = req.session.user.id;

    // --- CẬP NHẬT: Thêm bedroom, bathroom vào destructuring ---
    const {
      title,
      description,
      area,
      price,
      status,
      property_type,
      rental_type,
      location,
      amenities,
      bedroom, // Mới
      bathroom // Mới
    } = req.body;

    const province = location?.province;
    const ward = location?.ward;
    const detail = location?.detail;
    const longitude = location?.longitude;
    const latitude = location?.latitude;
    const validAmenities = Array.isArray(amenities) ? amenities : [];

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

    // Xử lý ảnh (Giữ nguyên)
    let images = [];
    if (req.body.images) {
      if (Array.isArray(req.body.images)) images = req.body.images;
      else if (typeof req.body.images === "string")
        images = req.body.images
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
    }

    if (images.length > 10) {
      return res.status(400).json({ message: "Max 10 images allowed" });
    }

    let cloudinaryImages = [];
    if (images.length > 0) {
      cloudinaryImages = await Promise.all(
        images.map((img) =>
          cloudinary.uploader.upload(img, { folder: "products" })
        )
      );
    }

    if (images.length > 0 && cloudinaryImages.length !== images.length) {
      return res.status(500).json({ message: "Image upload failed" });
    }

    const savedImages = cloudinaryImages.map((img) => ({
      url: img.secure_url,
      public_id: img.public_id,
    }));

    const finalLat = latitude ? parseFloat(latitude) : 21.028511;
    const finalLng = longitude ? parseFloat(longitude) : 105.854444;

    // --- CẬP NHẬT: Lưu các trường số liệu mới ---
    const list = new Listing({
      title: title,
      description: description,
      area: Number(area),             // Ép kiểu sang số
      price: price,
      status: status,
      property_type: property_type,
      rental_type: rental_type,
      images: savedImages,
      owner: ownerId,
      bedroom: bedroom ? Number(bedroom) : 0, // Mới: Ép kiểu sang số
      bathroom: bathroom ? Number(bathroom) : 0, // Mới: Ép kiểu sang số
      location: {
        province: province,
        ward: ward,
        detail: detail,
        coords: {
          type: "Point",
          coordinates: [finalLng, finalLat],
        },
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
      page,
      limit,
      sort,
      userLat,
      userLng,
      radius
    } = req.query;

    const query = {};

    if (userLat && userLng && radius) {
      const radiusInMeters = parseFloat(radius) * 1000;
      query["location.coords"] = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(userLng), parseFloat(userLat)],
          },
          $maxDistance: radiusInMeters,
        },
      };
    }

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
      return res.status(400).json({ message: "minPrice and maxPrice must be numbers" });
    }
    if (
      (minArea !== undefined && isNaN(minA)) ||
      (maxArea !== undefined && isNaN(maxA))
    ) {
      return res.status(400).json({ message: "minArea and maxArea must be numbers" });
    }

    if (minP !== undefined || maxP !== undefined) {
      // Lưu ý: Nếu price trong DB vẫn là String thì so sánh $gte/$lte có thể không chính xác
      // Tốt nhất nên convert Price trong DB sang Number nếu có thể.
      query.price = {};
      if (minP !== undefined) query.price.$gte = minP;
      if (maxP !== undefined) query.price.$lte = maxP;
    }
    
    // Diện tích giờ là Number nên so sánh sẽ chính xác hơn
    if (minA !== undefined || maxA !== undefined) {
      query.area = {};
      if (minA !== undefined) query.area.$gte = minA;
      if (maxA !== undefined) query.area.$lte = maxA;
    }

    const pageNum = page && Number(page) > 0 ? Number(page) : 1;
    const defaultLimit = 30;
    const lim = limit && Number(limit) > 0 ? Number(limit) : defaultLimit;
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
      .populate('owner', 'name profile')
      .populate('property_type', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(lim);

    if (!listings || listings.length === 0) {
      return res.status(200).json({
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
    const listing = await Listing.findById(id)
      .populate('owner', 'name profile createdAt')
      .populate('property_type', 'name');
    if (!listing) return res.status(404).json({ message: "Not Found" });
    return res.json(listing);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMyListings = async (req, res) => {
  try {
    if (!req.session || !req.session.user)
      return res.status(401).json({ message: "Vui lòng đăng nhập" });

    const userId = req.session.user.id;
    const listings = await Listing.find({ owner: userId })
      .populate('owner', 'name profile')
      .populate('property_type', 'name')
      .sort({ createdAt: -1 });

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

    if (listing.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền chỉnh sửa bài đăng này" });
    }

    // -------- Xử lý images --------
    let newImages = [];
    if (req.body.images) {
      if (Array.isArray(req.body.images)) newImages = req.body.images;
      else if (typeof req.body.images === "string")
        newImages = req.body.images.split(",").map(s => s.trim()).filter(Boolean);
    }

    const oldImages = listing.images || [];
    const base64Images = newImages.filter(img => typeof img === "string" && img.startsWith("data:"));
    const keptImages = newImages.filter(img => typeof img === "object" && img.url);
    const removedImages = oldImages.filter(old =>
      !keptImages.some(k => k.public_id === old.public_id)
    );

    await Promise.all(
      removedImages.map(async (img) => {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      })
    );

    const uploadedImages = await Promise.all(
      base64Images.map(img =>
        cloudinary.uploader.upload(img, { folder: "products" })
      )
    );

    const uploadedConverted = uploadedImages.map(i => ({
      url: i.secure_url,
      public_id: i.public_id
    }));

    const finalImages = [...keptImages, ...uploadedConverted];

    // -------- Cập nhật các trường --------
    const {
      title,
      description,
      area,
      price,
      status,
      property_type,
      rental_type,
      location,
      amenities,
      bedroom, // Mới
      bathroom // Mới
    } = req.body;

    listing.title = title ?? listing.title;
    listing.description = description ?? listing.description;
    
    // Cập nhật area (đảm bảo là số)
    if (area !== undefined) listing.area = Number(area);
    
    listing.price = price ?? listing.price;
    listing.status = status ?? listing.status;
    listing.property_type = property_type ?? listing.property_type;
    listing.rental_type = rental_type ?? listing.rental_type;
    listing.amenities = Array.isArray(amenities) ? amenities : listing.amenities;
    listing.images = finalImages;
    
    // Cập nhật bedroom/bathroom (Mới)
    if (bedroom !== undefined) listing.bedroom = Number(bedroom);
    if (bathroom !== undefined) listing.bathroom = Number(bathroom);

    if (location) {
      listing.location.province = location.province ?? listing.location.province;
      listing.location.ward = location.ward ?? listing.location.ward;
      listing.location.detail = location.detail ?? listing.location.detail;

      if (location.longitude && location.latitude) {
        listing.location.coords = {
          type: "Point",
          coordinates: [
            parseFloat(location.longitude),
            parseFloat(location.latitude),
          ],
        };
      }
    }

    await listing.save();

    return res.json({
      message: "Cập nhật thành công",
      listing
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteListing = async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    const userId = req.session.user.id;
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid listing id" });
    }

    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ message: "Not Found" });

    if (listing.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Bạn không có quyền xóa bài đăng này" });
    }

    await Promise.all(
      listing.images.map(async (img) => {
        if (img.public_id) {
          await cloudinary.uploader.destroy(img.public_id);
        }
      })
    );

    await Listing.findByIdAndDelete(id);

    return res.json({ message: "Tin đăng được xóa thành công" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};