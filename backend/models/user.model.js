import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['login', 'login-google'], default: 'login'
    },

    //profile
    profile: {
        fullName: String,
        gender: {
            type: String,
            enum: ['male', 'female', 'other']
        },
        birthday: Date,
        address: String,
        bio: String
    },

    //Thông tin về gói đăng ký
    subscriptionPlan: {
        plan: {
            type: mongoose.Schema.Types.ObjectId, ref: 'SubscriptionPlan'
        },
        startDate: Date,
        endDate: Date,
        status: {
            type: String,
            enum: ['active', 'inactive', 'canceled'], default: 'inactive'
        }
    },

    //Mối quan hệ N-N với savedListings
    savedListings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing'
    }]
    ,
    // Admin: flag to ban/block a user
    isBanned: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true
})

const User = mongoose.model("User", userSchema);

export default User;