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

// Flatten nested object to dot notation for MongoDB $set
// e.g., { cms: { promo: { isMarquee: true } } } becomes { 'cms.promo.isMarquee': true }
const flattenObject = (obj, prefix = '') => {
    const result = {};

    for (const [key, value] of Object.entries(obj)) {
        const newKey = prefix ? `${prefix}.${key}` : key;

        if (value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value)) {
            // Recursively flatten nested objects
            Object.assign(result, flattenObject(value, newKey));
        } else if (value !== undefined) {
            // Add leaf values directly (including arrays and primitives)
            result[newKey] = value;
        }
    }

    return result;
};

// Update store configuration using MongoDB's $set operator for reliability
const updateStoreConfig = async (updateData) => {
    console.log('========== STORE UPDATE START ==========');
    console.log('Input updateData:', JSON.stringify(updateData, null, 2));

    // Flatten the update data to dot notation
    const flattenedUpdate = flattenObject(updateData);
    console.log('Flattened update:', JSON.stringify(flattenedUpdate, null, 2));

    // Use findOneAndUpdate with $set - this is the most reliable method
    // for updating nested fields in MongoDB
    const store = await Store.findOneAndUpdate(
        {}, // Match the single store document (singleton)
        { $set: flattenedUpdate },
        {
            new: true,           // Return the updated document
            upsert: true,        // Create if doesn't exist
            runValidators: true  // Run schema validations
        }
    );

    if (!store) {
        throw new Error('Failed to update store configuration');
    }

    console.log('========== STORE UPDATE END ==========');
    console.log('Saved CMS promo:', JSON.stringify(store.cms?.promo, null, 2));

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

    return store;
}

module.exports = {
    getStoreConfig,
    updateStoreConfig,
    getPublicStoreConfig
};
