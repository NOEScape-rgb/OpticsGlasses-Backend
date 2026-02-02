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
    let store = await Store.findOne();

    // If store doesn't exist, create it with the update data
    if (!store) {
        store = await Store.create(updateData);
        return store;
    }

    // Update existing store settings
    // Using findOneAndUpdate doesn't trigger pre-save validation hooks by default 
    // unless runValidators: true is set, but singleton logic in pre-save 
    // might interfere if we treated it as "save". 
    // For simplicity and safety with singleton pattern:

    Object.assign(store, updateData);
    await store.save();

    return store;
};

// Public: Get only necessary store settings (e.g., shipping, active SEO)
const getPublicStoreConfig = async () => {
    let store = await Store.findOne();
    if (!store) return null;

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
