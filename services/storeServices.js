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
    console.log('UPDATING STORE CONFIG WITH:', JSON.stringify(updateData, null, 2));

    // Flatten nested object to dot notation for MongoDB $set
    // e.g., { cms: { promo: { isMarquee: true } } } becomes { 'cms.promo.isMarquee': true }
    const flattenObject = (obj, prefix = '') => {
        const result = {};

        for (const [key, value] of Object.entries(obj)) {
            const newKey = prefix ? `${prefix}.${key}` : key;

            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                // Recursively flatten nested objects
                Object.assign(result, flattenObject(value, newKey));
            } else {
                // Add leaf values directly
                result[newKey] = value;
            }
        }

        return result;
    };

    const flattenedUpdate = flattenObject(updateData);
    console.log('FLATTENED UPDATE:', JSON.stringify(flattenedUpdate, null, 2));

    // Use findOneAndUpdate with $set for reliable atomic updates
    let store = await Store.findOneAndUpdate(
        {}, // Match the single store document (singleton pattern)
        { $set: flattenedUpdate },
        {
            new: true, // Return the updated document
            upsert: true, // Create if doesn't exist
            runValidators: true, // Run model validations
            setDefaultsOnInsert: true // Set defaults if creating new
        }
    );

    // If store was newly created, set required defaults
    if (!store.storeProfile || !store.storeProfile.name) {
        store = await Store.findOneAndUpdate(
            {},
            {
                $set: {
                    'storeProfile.name': 'OpticsGlasses',
                    'storeProfile.email': 'admin@opticsglasses.com'
                }
            },
            { new: true }
        );
    }

    console.log('RESULTING STORE CONFIG CMS:', JSON.stringify(store.cms, null, 2));
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
