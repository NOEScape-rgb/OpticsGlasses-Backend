const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.join(__dirname, ".env") });

const User = require("./models/User");

const migrateUsers = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI);
        console.log("Connected to MongoDB...");

        const result = await User.updateMany(
            { isVerified: { $exists: false } },
            { $set: { isVerified: false } }
        );

        console.log(`Migration successful! Updated ${result.modifiedCount} users.`);
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
};

migrateUsers();
