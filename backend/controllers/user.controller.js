import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';

export const userRegister = async (req, res) => {
    try {
        const { username, password, name, phone, role } = req.body;

        let user = await User.findOne({ username });
        if (user) {
            return res.status(400).json({
                message: "Tên người dùng đã tồn tại"
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username: username,
            password: hashedPassword,
            name: name,
            phone: phone,
            role: role
        });

        await user.save();

        // --- SỬA: Dùng _id thay vì id ---
        req.session.user = {
            _id: user._id, 
            username: user.username,
            name: user.name
        }
        
        // Lưu thời gian login để tính session expiry
        req.session.loginTime = Date.now();

        return res.status(201).json({
            message: "Đăng ký thành công",
            user: req.session.user,
            loginTime: req.session.loginTime
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Server Error"
        })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        const deleteUser = await User.findByIdAndDelete(id);

        if (!deleteUser) {
            return res.status(404).json({
                message: "Not Found"
            })
        }

        return res.json({
            messgae: "Người dùng được xóa thành công"
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Server Error"
        })
    }
}

export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Not Enough Information"
            })
        }

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                message: "Username wrong"
            })
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({
                message: "Password wrong"
            })
        }

        // --- SỬA: Dùng _id thay vì id ---
        req.session.user = {
            _id: user._id,
            username: user.username,
            name: user.name
        }
        
        // Lưu thời gian login để tính session expiry
        req.session.loginTime = Date.now();

        res.json({
            message: "Login successfully",
            user: req.session.user,
            loginTime: req.session.loginTime
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Server error"
        })
    }
}

export const getUserInfor = async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                message: "Vui lòng đăng nhập"
            });
        }

        // --- SỬA: Gọi ._id thay vì .id ---
        const user_id = req.session.user._id;

        const user = await User.findById(user_id).select("username name phone role createdAt");

        if (!user) {
            return res.status(404).json({
                message: "User không tồn tại"
            });
        }

        res.json({
            message: "Thông tin người dùng mới nhất",
            user: user
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Server error"
        });
    }
}

export const updateUserInfo = async (req, res) => {
    try {
        if (!req.session || !req.session.user) {
            return res.status(401).json({
                message: "Vui long dang nhap"
            });
        }

        // --- SỬA: Gọi ._id thay vì .id ---
        const user_id = req.session.user._id;
        
        const { name, phone } = req.body;
        if (!name && !phone) {
            return res.status(400).json({
                message: "Vui long cung cap thong tin can cap nhat"
            });
        }

        const updateFields = {};
        if (name) updateFields.name = name;
        if (phone) updateFields.phone = phone;

        const updatedUser = await User.findByIdAndUpdate(
            user_id,
            { $set: updateFields },
            { new: true }
        ).select("name phone role createdAt");

        if (!updatedUser) {
            return res.status(404).json({
                message: "User không tồn tại"
            });
        }

        res.json({
            message: "Cập nhật thành công",
            user: updatedUser
        });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: "Server error"
        })
    }
}

export const checkSession = (req, res) => {
    // Debug log
    console.log("--> Check Session API:", req.session?.user);

    try {
        if (req.session && req.session.user) {
            const SESSION_DURATION = 30 * 60 * 1000; // 30 phút
            const loginTime = req.session.loginTime || Date.now();
            const elapsedTime = Date.now() - loginTime;
            const remainingTime = Math.max(0, SESSION_DURATION - elapsedTime);
            
            // Reset loginTime để extend session
            req.session.loginTime = Date.now();
            
            return res.status(200).json({ 
                message: "Session active", 
                user: req.session.user,
                loginTime: req.session.loginTime,
                remainingTime: remainingTime,
                sessionDuration: SESSION_DURATION
            });
        } else {
            return res.status(200).json({ message: "No active session", user: null });
        }
    } catch (error) {
        console.error("Lỗi Check Session:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const logoutUser = async (req, res) => {
    req.session.destroy(() => {
        res.json({
            message: "Đã đăng xuất"
        });
    })
}

export const toggleSaveListing = async (req, res) => {
    try {
        if (!req.session || !req.session.user) return res.status(401).json({ message: "Vui lòng đăng nhập" });
        
        // --- SỬA: Gọi ._id thay vì .id ---
        const userId = req.session.user._id;
        
        const listingId = req.params.listingId;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User không tồn tại" });

        const idx = user.savedListings ? user.savedListings.findIndex(id => id.toString() === listingId.toString()) : -1;
        if (idx === -1) {
            // add
            user.savedListings = user.savedListings || [];
            user.savedListings.push(listingId);
            await user.save();
            return res.json({ message: "Đã lưu bài viết" });
        } else {
            // remove
            user.savedListings.splice(idx, 1);
            await user.save();
            return res.json({ message: "Đã bỏ lưu bài viết" });
        }
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Server error" });
    }
}

// Lấy danh sách tin đăng đã lưu của người dùng hiện tại
export const getSavedListings = async (req, res) => {
    try {
        if (!req.session || !req.session.user) return res.status(401).json({ message: "Vui lòng đăng nhập" });
        
        // --- SỬA: Gọi ._id thay vì .id ---
        const userId = req.session.user._id;
        
        const user = await User.findById(userId).populate({ path: 'savedListings', options: { sort: { createdAt: -1 } } });
        if (!user) return res.status(404).json({ message: "User không tồn tại" });

        return res.json({ message: "Lấy danh sách đã lưu thành công", listings: user.savedListings || [] });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "Server error" });
    }
};

export const searchUsers = async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.json([]);

        // Tìm user theo tên, trừ bản thân mình ra
        const users = await User.find({
            username: { $regex: query, $options: "i" },
            // --- SỬA: Gọi ._id thay vì .id ---
            _id: { $ne: req.session.user._id }
        }).select("username name role"); 

        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
};