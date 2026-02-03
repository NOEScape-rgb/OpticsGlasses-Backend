require("dotenv").config();
const mongoose = require("mongoose");
const Store = require("./models/Store");

async function runTest() {
    try {
        console.log("Connecting to DB...", process.env.DATABASE_URI);
        await mongoose.connect(process.env.DATABASE_URI + "/opticsGlasses");
        console.log("Connected.");

        const updateData = {
            storeProfile: {
                name: "Test Update " + Date.now(),
                email: "test@example.com"
            }
        };

        console.log("Running findOneAndUpdate...");
        const store = await Store.findOneAndUpdate({}, updateData, {
            new: true,
            upsert: true,
            runValidators: true,
            setDefaultsOnInsert: true
        });
        console.log("Update successful. Store name:", store.storeProfile.name);

        process.exit(0);
    } catch (error) {
        console.error("FAILURE:", error);
        process.exit(1);
    }
}

runTest();
