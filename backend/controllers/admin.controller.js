import Listing from "../models/listing.model.js";
import User from "../models/user.model.js";
import SystemNotification from "../models/systemNotification.model.js";

export const getStats = async (req, res) => {
  try {
    // Totals
    const totalListings = await Listing.countDocuments();
    const totalUsers = await User.countDocuments();

    // Listing counts by status
    const listingStatusAgg = await Listing.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const statusCounts = listingStatusAgg.reduce((acc, cur) => {
      acc[cur._id || "unknown"] = cur.count;
      return acc;
    }, {});

    // Users signups last 7 days
    const start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const usersAgg = await User.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const usersLast7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const found = usersAgg.find((x) => x._id === key);
      usersLast7Days.push({ date: key, count: found ? found.count : 0 });
    }

    const propertyStatus = listingStatusAgg.map((d) => ({ name: d._id || "unknown", value: d.count }));

    return res.json({
      totals: { totalListings, totalUsers },
      usersLast7Days,
      propertyStatus,
      statusCounts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find()
      .populate("owner", "name username profile")
      .populate("property_type", "name")
      .sort({ createdAt: -1 })
      .limit(500);

    return res.json({ listings });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const updateListingStatus = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body; // expected: 'approved'|'rejected'|'pending'

    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    listing.status = status;
    await listing.save();

    return res.json({ message: "Listing status updated", listing });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("username name role createdAt isBanned").sort({ createdAt: -1 });
    return res.json({ users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Aggregation: user signups last 7 days
export const getUserSignupsLast7Days = async (req, res) => {
  try {
    const start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const data = await User.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build array for last 7 days
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const found = data.find((x) => x._id === key);
      result.push({ date: key, count: found ? found.count : 0 });
    }

    return res.json({ data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Aggregation: properties count by status
export const getPropertyStatusDistribution = async (req, res) => {
  try {
    const data = await Listing.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const result = data.map((d) => ({ name: d._id || 'unknown', value: d.count }));
    return res.json({ data: result });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const toggleBanUser = async (req, res) => {
  try {
    const id = req.params.id;
    const { ban } = req.body; // boolean

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isBanned = !!ban;
    await user.save();

    return res.json({ message: "User updated", user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const broadcastSystemNotification = async (req, res) => {
  try {
    const { title, message, type = "info", audience = "all" } = req.body;
    if (!message || !title)
      return res.status(400).json({ message: "Missing title or message" });

    // 1. Persist notification
    const notif = await SystemNotification.create({ title, message, type, audience });

    // 2. Emit event to connected sockets (only 'all' for now)
    req.io?.emit("system_notification", { id: notif._id, title, message, type, audience, createdAt: notif.createdAt });

    return res.json({ message: "Broadcast saved and sent", notification: notif });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const items = await SystemNotification.find().sort({ createdAt: -1 }).limit(100);
    return res.json({ notifications: items });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
