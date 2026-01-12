import mongoose from "mongoose";
import Listing from "../models/listing.model.js";
import cloudinary from "../config/cloudinary.js";

// --- MIDDLEWARE verifyToken ĐÃ ĐẢM BẢO req.userId TỒN TẠI CHO CÁC ROUTE PROTECTED ---

export const createList = async (req, res) => {
  try {
    // 1. Lấy ID từ Token (thay cho Session)
    const ownerId = req.userId;

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
      bedroom,
      bathroom,
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

    // Xử lý ảnh
    let images = [];
    if (req.body.images) {
      if (Array.isArray(req.body.images)) images = req.body.images;
      else if (typeof req.body.images === "string")
        images = req.body.images
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
    }

    if (images.length > 10)
      return res.status(400).json({ message: "Max 10 images allowed" });

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

    const list = new Listing({
      title,
      description,
      area: Number(area),
      price,
      status: "pending", // force pending on create
      property_type,
      rental_type,
      images: savedImages,
      owner: ownerId, // Dùng ID từ JWT
      bedroom: bedroom ? Number(bedroom) : 0,
      bathroom: bathroom ? Number(bathroom) : 0,
      location: {
        province,
        ward,
        detail,
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
      return res
        .status(400)
        .json({ message: "Validation failed: " + error.message });
    }
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
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
      radius,
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
    // By default, only surface 'approved' listings to public unless explicitly filtered
    if (status) query.status = status;
    else query.status = "approved";

    const minP = minPrice !== undefined ? Number(minPrice) : undefined;
    const maxP = maxPrice !== undefined ? Number(maxPrice) : undefined;
    const minA = minArea !== undefined ? Number(minArea) : undefined;
    const maxA = maxArea !== undefined ? Number(maxArea) : undefined;

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
      .populate("owner", "name profile")
      .populate("property_type", "name")
      .sort(sortObj)
      .skip(skip)
      .limit(lim);

    return res.json({
      message: "Lấy danh sách tin đăng thành công",
      listings,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getListingById = async (req, res) => {
  try {
    const id = req.params.id;
    const listing = await Listing.findById(id)
      .populate("owner", "name profile createdAt phone avatar")
      .populate("property_type", "name");
    if (!listing) return res.status(404).json({ message: "Not Found" });
    // If listing is not approved, only the owner or admin may view it
    if (listing.status !== "approved") {
      try {
        const token = req.cookies?.token;
        if (!token) return res.status(404).json({ message: "Not Found" });
        const jwt = (await import("jsonwebtoken")).default;
        const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const viewerId = payload._id || payload.id;
        if (!viewerId) return res.status(404).json({ message: "Not Found" });

        // If owner, allow
        if (
          listing.owner &&
          (listing.owner._id?.toString() === viewerId.toString() ||
            listing.owner.toString() === viewerId.toString())
        ) {
          return res.json(listing);
        }

        // If admin, allow
        const User = (await import("../models/user.model.js")).default;
        const viewer = await User.findById(viewerId).select("role");
        if (viewer && viewer.role === "admin") return res.json(listing);
      } catch (e) {
        // token invalid or other error -> treat as not found
        return res.status(404).json({ message: "Not Found" });
      }
      return; // already responded
    }

    return res.json(listing);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getMyListings = async (req, res) => {
  try {
    // Lấy userId từ token
    const userId = req.userId;

    // Lấy filter từ query
    const { status } = req.query;

    // Query cơ bản
    const query = { owner: userId };

    // Chỉ filter khi status tồn tại
    if (status) {
      query.status = status;
    }

    const listings = await Listing.find(query)
      .populate("owner", "name profile")
      .populate("property_type", "name")
      .sort({ createdAt: -1 });

    return res.json({
      message: "Lấy bài đăng của tôi thành công",
      listings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getUserListings = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const listings = await Listing.find({ owner: userId, status: "approved" })
      .populate("owner", "name profile")
      .populate("property_type", "name")
      .sort({ createdAt: -1 });

    return res.json({ message: "Lấy bài đăng của user thành công", listings });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateListing = async (req, res) => {
  try {
    // 3. Lấy ID từ Token
    const userId = req.userId;
    const id = req.params.id;

    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    if (listing.owner.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền chỉnh sửa bài đăng này" });
    }

    // Xử lý images
    let newImages = [];
    if (req.body.images) {
      if (Array.isArray(req.body.images)) newImages = req.body.images;
      else if (typeof req.body.images === "string")
        newImages = req.body.images
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
    }

    const oldImages = listing.images || [];
    const base64Images = newImages.filter(
      (img) => typeof img === "string" && img.startsWith("data:")
    );
    const keptImages = newImages.filter(
      (img) => typeof img === "object" && img.url
    );
    const removedImages = oldImages.filter(
      (old) => !keptImages.some((k) => k.public_id === old.public_id)
    );

    await Promise.all(
      removedImages.map(async (img) => {
        if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
      })
    );

    const uploadedImages = await Promise.all(
      base64Images.map((img) =>
        cloudinary.uploader.upload(img, { folder: "products" })
      )
    );

    const uploadedConverted = uploadedImages.map((i) => ({
      url: i.secure_url,
      public_id: i.public_id,
    }));

    const finalImages = [...keptImages, ...uploadedConverted];

    // Cập nhật fields
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
      bedroom,
      bathroom,
    } = req.body;

    listing.title = title ?? listing.title;
    listing.description = description ?? listing.description;
    if (area !== undefined) listing.area = Number(area);
    listing.price = price ?? listing.price;
    listing.status = "pending";
    listing.property_type = property_type ?? listing.property_type;
    listing.rental_type = rental_type ?? listing.rental_type;
    listing.amenities = Array.isArray(amenities)
      ? amenities
      : listing.amenities;
    listing.images = finalImages;
    if (bedroom !== undefined) listing.bedroom = Number(bedroom);
    if (bathroom !== undefined) listing.bathroom = Number(bathroom);

    if (location) {
      listing.location.province =
        location.province ?? listing.location.province;
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

    return res.json({ message: "Cập nhật thành công", listing });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const deleteListing = async (req, res) => {
  try {
    // 4. Lấy ID từ Token
    const userId = req.userId;
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid listing id" });
    }

    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ message: "Not Found" });

    if (listing.owner.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa bài đăng này" });
    }

    await Promise.all(
      listing.images.map(async (img) => {
        if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
      })
    );

    await Listing.findByIdAndDelete(id);

    return res.json({ message: "Tin đăng được xóa thành công" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};

export const searchListings = async (req, res) => {
  console.log("Search Params:", req.query);
  try {
    const {
      keyword,
      province,
      property_type,
      rental_type,
      bedroom,
      bathroom,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      sort,
      status,
    } = req.query;

    let query = {};

    // Default to only show approved listings in public search unless explicit status is requested
    if (status) query.status = status;
    else query.status = "approved";

    // Dùng new RegExp để an toàn hơn
    if (keyword) {
      const searchRegex = new RegExp(keyword, "i");
      query.$or = [
        { title: searchRegex },
        { "location.detail": searchRegex },
        { "location.province": searchRegex },
        { "location.ward": searchRegex },
      ];
    }

    if (province) query["location.province"] = new RegExp(province, "i");
    if (property_type && property_type.length === 24)
      query.property_type = property_type;
    if (rental_type) query.rental_type = rental_type;
    if (bedroom) query.bedroom = { $gte: Number(bedroom) };
    if (bathroom) query.bathroom = { $gte: Number(bathroom) };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (minArea || maxArea) {
      query.area = {};
      if (minArea) query.area.$gte = Number(minArea);
      if (maxArea) query.area.$lte = Number(maxArea);
    }

    // 1. Định nghĩa từ khóa map sang field database
    const sortMapping = {
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      area_asc: { area: 1 },
      area_desc: { area: -1 },
      oldest: { createdAt: 1 },
      newest: { createdAt: -1 },
    };

    let sortOption = {};
    // if (sort === "price_asc") sortOption = { price: 1 };
    // if (sort === "price_desc") sortOption = { price: -1 };

    // // --- SỬA LỖI SORT AREA ---
    // if (sort === "area_asc") sortOption = { area: 1 }; // Trước đây bạn gán nhầm là price: 1
    // if (sort === "area_desc") sortOption = { area: -1 }; // Trước đây bạn gán nhầm là price: -1

    // if (sort === "oldest") sortOption = { createdAt: 1 };
    // if (sort === "newest") sortOption = { createdAt: -1 };

    if (sort) {
      // 2. Tách chuỗi sort bằng dấu phẩy (nếu client gửi dạng price_asc,oldest)
      // Nếu client gửi ?sort=price_asc&sort=oldest (array) thì Express tự xử lý thành array, ta chuẩn hóa về mảng.
      const sortParams = Array.isArray(sort) ? sort : sort.split(",");

      // 3. Duyệt qua từng yêu cầu sort và gộp vào object sortOption
      sortParams.forEach((item) => {
        const key = item.trim(); // Xóa khoảng trắng thừa
        if (sortMapping[key]) {
          // Object.assign giúp gộp object: {price: 1} + {createdAt: 1} => {price: 1, createdAt: 1}
          Object.assign(sortOption, sortMapping[key]);
        }
      });
    }

    // 4. Nếu không có sort nào hợp lệ (hoặc không truyền), mặc định là mới nhất
    if (Object.keys(sortOption).length === 0) {
      sortOption = { createdAt: -1 };
    }

    // console.log("Final Sort Option:", sortOption);
    // Kết quả sẽ dạng: { price: 1, createdAt: 1 }

    const listings = await Listing.find(query)
      .sort(sortOption)
      .limit(20)
      .populate("property_type", "name")
      .populate("owner", "username avatar name email");

    res.status(200).json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ success: false, message: "Search Error" });
  }
};

export const updateListingStatus = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { status } = req.body;

    if (!["approved", "closed", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // 🔒 Chỉ owner mới được sửa
    if (listing.owner.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🔒 Chỉ cho phép sửa khi đang approved hoặc closed
    if (!["approved", "closed", "rejected"].includes(listing.status)) {
      return res.status(400).json({
        message: "Cannot update status from current state",
      });
    }

    // 🔁 Toggle hợp lệ
    listing.status = status;
    await listing.save();

    return res.json({
      message: "Listing status updated",
      listing,
    });
  } catch (error) {
    console.error("updateListingStatus error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
