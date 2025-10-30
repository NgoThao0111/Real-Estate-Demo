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