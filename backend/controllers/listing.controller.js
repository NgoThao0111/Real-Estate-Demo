import Listing from "../models/listing.model.js";

export const createList = async (req, res) => {
    try {
        // Safer destructuring: handle missing address
        const { title, description, area, price, status, property_type, rental_type, address } = req.body;
        const city = address?.city;
        const ward = address?.ward;
        const detail = address?.detail;

        // Validate required fields
        if (!title || !area || !price || !status || !property_type || !rental_type || !city || !ward || !detail) {
            return res.status(400).json({ message: "Missing required fields" });
        }
        
        const list = new Listing({
            title: title,
            description: description,
            area: area,
            price: price,
            status: status,
            property_type: property_type,
            rental_type: rental_type,
            address: {
                city: city,
                ward: ward,
                detail: detail
            }
        });

        // if user is logged in, attach createdBy
        if (req.session && req.session.user && req.session.user.id) {
            list.createdBy = req.session.user.id;
        }

        await list.save();

        return res.status(201).json({
            message: "Create List Successfully",
            list_id: list._id
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Server error"
        })
    }
}

// GET /api/listings
// Supports query params: search, city, property_type, rental_type, status,
// minPrice, maxPrice, minArea, maxArea, page, limit, sort
export const getListings = async (req, res) => {
    try {
        const {
            search,
            city,
            property_type,
            rental_type,
            status,
            minPrice,
            maxPrice,
            minArea,
            maxArea,
            page = 1,
            limit = 10,
            sort,
        } = req.query;

        const query = {};

        if (search) {
            const regex = new RegExp(search, "i");
            query.$or = [{ title: regex }, { description: regex }];
        }

        if (city) query["address.city"] = city;
        if (property_type) query.property_type = property_type;
        if (rental_type) query.rental_type = rental_type;
        if (status) query.status = status;

        // numeric filters - validate inputs
        const minP = minPrice !== undefined ? Number(minPrice) : undefined;
        const maxP = maxPrice !== undefined ? Number(maxPrice) : undefined;
        const minA = minArea !== undefined ? Number(minArea) : undefined;
        const maxA = maxArea !== undefined ? Number(maxArea) : undefined;

        if ((minPrice !== undefined && isNaN(minP)) || (maxPrice !== undefined && isNaN(maxP))) {
            return res.status(400).json({ message: "minPrice and maxPrice must be numbers" });
        }
        if ((minArea !== undefined && isNaN(minA)) || (maxArea !== undefined && isNaN(maxA))) {
            return res.status(400).json({ message: "minArea and maxArea must be numbers" });
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

        // pagination
        const pageNum = Math.max(1, Number(page));
        const lim = Math.max(1, Number(limit));
        const skip = (pageNum - 1) * lim;

        // sorting
        let sortObj = { createdAt: -1 }; // newest by default
        if (sort) {
            if (sort === "price_asc") sortObj = { price: 1 };
            else if (sort === "price_desc") sortObj = { price: -1 };
            else if (sort === "area_asc") sortObj = { area: 1 };
            else if (sort === "area_desc") sortObj = { area: -1 };
            else if (sort === "oldest") sortObj = { createdAt: 1 };
        }

        const listings = await Listing.find(query).sort(sortObj).skip(skip).limit(lim);

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