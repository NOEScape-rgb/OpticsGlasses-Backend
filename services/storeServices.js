const Store = require("../models/Store");

// Get the store configuration (Singleton pattern logic)
const getStoreConfig = async () => {
    let store = await Store.findOne();

    // If no store config exists, create a default one
    if (!store) {
        store = await Store.create({
            storeProfile: {
                name: "OpticsGlasses",
                email: "admin@opticsglasses.com"
            }
        });
    }

    return store;
};

// Update store configuration
const updateStoreConfig = async (updateData) => {
    // Upsert: update if exists, insert if it doesn't.
    // 'new: true' returns the modified document.
    // 'runValidators: true' ensures schema validation rules are applied.
    const store = await Store.findOneAndUpdate({}, updateData, {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true // important for upsert
    });

    return store;
};

// Public: Get only necessary store settings (e.g., shipping, active SEO)
const getPublicStoreConfig = async () => {
    let store = await Store.findOne();

    // If no store config exists, create a default one (same as getStoreConfig)
    if (!store) {
        store = await Store.create({
            storeProfile: {
                name: "OpticsGlasses",
                email: "admin@opticsglasses.com"
            }
        });
    }

    // Return a subset of data safe for public consumption if needed
    // or just return the whole object if nothing is sensitive.
    // Assuming everything in Store model is relatively public or frontend-needed.
    return store;
}

module.exports = {
    getStoreConfig,
    updateStoreConfig,
    getPublicStoreConfig
};
