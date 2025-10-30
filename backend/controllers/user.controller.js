import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';

export const userRegister = async (req, res) => {
    try {
        const {username, password, name, phone, role} = req.body;

        let user = await User.findOne({username});
        if(user) {
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

        return res.status(201).json({
            message: "Đăng ký thành công",
            userID: user._id
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

        if(!deleteUser) {
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
    
}