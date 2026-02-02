const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
        },
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            lowercase: true,
            unique: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: 8,
        },
        avatarUrl: {
            type: String,
            default: "https://www.muhammadjunaid.dev/assets/junaid_img.webp",
        },
        role: {
            type: String,
            default: "admin"
        }
    },
    {
        timestamps: true,
        collection: "admins",
    }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
