import Listing from "../models/listing.model.js";
import User from "../models/user.model.js";
import SystemNotification from "../models/systemNotification.model.js";
import AdminAction from "../models/adminAction.model.js";

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
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const limit = Math.min(200, parseInt(req.query.limit || "50"));
    const skip = (page - 1) * limit;

    // Filters: status, rental_type
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.rental_type) query.rental_type = req.query.rental_type;
    const [listings, total] = await Promise.all([
      Listing.find(query)
        .populate("owner", "name username profile email")
        .populate("property_type", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Listing.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limit);
    return res.json({ listings, total, page, pages });
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

    // Notify owner about status change and surface publish when approved
    try {
      const ownerId = listing.owner?.toString();
      if (ownerId) {
        req.io?.in(`user_${ownerId}`).emit('listing_status_changed', { listingId: listing._id, status });
      }
    } catch (e) {
      console.error('Failed to emit listing_status_changed', e);
    }

    // Audit
    try {
      await AdminAction.create({ admin: req.userId, action: 'update_listing_status', target: listing._id, meta: { status } });
    } catch (e) {
      console.error('Failed to record admin action', e);
    }

    return res.json({ message: "Listing status updated", listing });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const limit = Math.min(200, parseInt(req.query.limit || "50"));
    const skip = (page - 1) * limit;

    const query = {};
    // Include email and phone for admin view
    const [users, total] = await Promise.all([
      User.find(query).select("username name role createdAt isBanned email phone").sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(query),
    ]);

    const pages = Math.ceil(total / limit);
    return res.json({ users, total, page, pages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Admin actions (audit log)
export const getAdminActions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(200, parseInt(req.query.limit || '50'));
    const skip = (page - 1) * limit;

    const [actions, total] = await Promise.all([
      AdminAction.find().populate('admin', 'username name').sort({ createdAt: -1 }).skip(skip).limit(limit),
      AdminAction.countDocuments(),
    ]);

    return res.json({ actions, total, page, pages: Math.ceil(total / limit) });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: 'Server error' });
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

// Aggregation: listings created in last 7 days
export const getListingsLast7Days = async (req, res) => {
  try {
    const start = new Date();
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const data = await Listing.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

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

// Admin: delete any listing by id
export const deleteListingAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const listing = await Listing.findById(id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    // delete cloudinary images if present
    try {
      const cloudinary = (await import("../config/cloudinary.js")).default;
      await Promise.all((listing.images || []).map(async (img) => {
        if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
      }));
    } catch (e) {
      console.error('Error deleting images', e);
    }

    await Listing.findByIdAndDelete(id);

    try {
      await AdminAction.create({ admin: req.userId, action: 'delete_listing', target: id, meta: {} });
    } catch (e) { console.error('Audit failed', e); }

    return res.json({ message: 'Listing deleted by admin' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Reports management
import Report from "../models/report.model.js";

export const getReports = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1'));
    const limit = Math.min(200, parseInt(req.query.limit || '50'));
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      Report.find().populate('reporter', 'username name').populate('listing', 'title owner').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Report.countDocuments(),
    ]);

    const pages = Math.ceil(total / limit);
    return res.json({ reports, total, page, pages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Resolve a report (mark status)
export const resolveReport = async (req, res) => {
  try {
    const id = req.params.id;
    const r = await Report.findById(id);
    if (!r) return res.status(404).json({ message: 'Report not found' });
    await Report.findByIdAndDelete(id);
    try { await AdminAction.create({ admin: req.userId, action: 'delete_report', target: id, meta: {} }); } catch (e) {}
    return res.json({ message: 'Report deleted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Take action on a report: delete listing or ban owner
export const actionOnReport = async (req, res) => {
  try {
    const id = req.params.id;
    const { action } = req.body;

    const r = await Report.findById(id).populate('listing');
    if (!r) return res.status(404).json({ message: 'Report not found' });

    // Nếu listing đã mất → auto resolve + delete report
    if ((action === 'delete_listing' || action === 'ban_user') && !r.listing) {
      try {
        await AdminAction.create({
          admin: req.userId,
          action: 'resolve_report_missing_listing',
          target: r._id,
          meta: {}
        });
      } catch (e) {}

      await Report.findByIdAndDelete(r._id);

      return res.json({
        message: 'Bài viết gốc không còn tồn tại. Báo cáo đã được xóa.'
      });
    }

    // ================= DELETE LISTING =================
    if (action === 'delete_listing') {
      const listing = await Listing.findById(r.listing._id);

      if (listing) {
        try {
          const cloudinary = (await import("../config/cloudinary.js")).default;
          await Promise.all(
            (listing.images || []).map(img =>
              img.public_id ? cloudinary.uploader.destroy(img.public_id) : null
            )
          );
        } catch (e) {
          console.error('Image delete failed', e);
        }

        await Listing.findByIdAndDelete(listing._id);
      }

      try {
        await AdminAction.create({
          admin: req.userId,
          action: 'delete_listing_from_report',
          target: r._id,
          meta: { listing: r.listing._id }
        });
      } catch (e) {}

      await Report.findByIdAndDelete(r._id);

      return res.json({ message: 'Listing deleted and report removed' });
    }

    // ================= BAN USER =================
    if (action === 'ban_user') {
      const listing = await Listing.findById(r.listing._id);

      if (listing) {
        const owner = await User.findById(listing.owner);
        if (owner) {
          owner.isBanned = true;
          await owner.save();

          try {
            await AdminAction.create({
              admin: req.userId,
              action: 'ban_user_from_report',
              target: owner._id,
              meta: { report: r._id }
            });
          } catch (e) {}

          try {
            req.io?.in(`user_${owner._id}`).emit('force_logout', {
              message: 'Bị khóa do báo cáo vi phạm'
            });

            if (
              req.io?.in &&
              typeof req.io.in(`user_${owner._id}`).disconnectSockets === 'function'
            ) {
              await req.io.in(`user_${owner._id}`).disconnectSockets();
            }
          } catch (e) {
            console.error(e);
          }
        }
      }

      await Report.findByIdAndDelete(r._id);

      return res.json({ message: 'User banned and report removed' });
    }

    // ================= IGNORE =================
    try {
      await AdminAction.create({
        admin: req.userId,
        action: 'ignore_report',
        target: r._id,
        meta: {}
      });
    } catch (e) {}

    await Report.findByIdAndDelete(r._id);

    return res.json({ message: 'Report ignored and removed' });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
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

    // Audit
    try {
      await AdminAction.create({ admin: req.userId, action: 'toggle_ban_user', target: user._id, meta: { ban: user.isBanned } });
    } catch (e) {
      console.error('Failed to record admin action', e);
    }

    // If user was banned, notify their active sockets and attempt to disconnect
    try {
      const room = `user_${user._id}`;
      // Inform client to logout
      req.io?.in(room).emit('force_logout', { message: 'Tài khoản đã bị khóa bởi quản trị viên' });

      // Attempt server-side disconnect (best-effort, some socket.io versions support this)
      if (req.io?.in && typeof req.io.in(room).disconnectSockets === 'function') {
        await req.io.in(room).disconnectSockets();
      }
    } catch (e) {
      console.error('Failed to notify/disconnect user sockets', e);
    }

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

    // 2. Emit event to connected sockets
    if (audience === 'all') {
      req.io?.emit("system_notification", { id: notif._id, title, message, type, audience, createdAt: notif.createdAt });
    } else if (typeof audience === 'string' && audience.startsWith('user:')) {
      const userId = audience.split(':')[1];
      req.io?.in(`user_${userId}`)?.emit("system_notification", { id: notif._id, title, message, type, audience, createdAt: notif.createdAt });
    } else if (typeof audience === 'string' && audience.startsWith('email:')) {
      const email = audience.split(':')[1];
      // Find user by email and emit to their room if found
      try {
        const u = await User.findOne({ email });
        if (u) req.io?.in(`user_${u._id}`)?.emit("system_notification", { id: notif._id, title, message, type, audience, createdAt: notif.createdAt });
      } catch (e) {
        console.error('Failed to find user by email for broadcast', e);
      }
    } else {
      // Fallback: emit to all
      req.io?.emit("system_notification", { id: notif._id, title, message, type, audience, createdAt: notif.createdAt });
    }

    // Audit
    try {
      await AdminAction.create({ admin: req.userId, action: 'broadcast', target: notif._id, meta: { title, message, type, audience } });
    } catch (e) {
      console.error('Failed to record admin action', e);
    }

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
