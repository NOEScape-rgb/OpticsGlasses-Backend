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

    let finalUpdate = {};

    // Partially update cms object if present to prevent overwriting sub-objects
    if (updateData.cms) {
        const cms = updateData.cms;
        if (cms.hero) {
            Object.keys(cms.hero).forEach(key => finalUpdate[`cms.hero.${key}`] = cms.hero[key]);
        }
        if (cms.promo) {
            Object.keys(cms.promo).forEach(key => finalUpdate[`cms.promo.${key}`] = cms.promo[key]);
        }
        if (cms.featuredLimit !== undefined) {
            finalUpdate['cms.featuredLimit'] = cms.featuredLimit;
        }
        if (cms.heroSlides) {
            finalUpdate['cms.heroSlides'] = cms.heroSlides;
        }
    }

    // Handle other top-level fields (shipping, storeProfile, seo)
    ['storeProfile', 'shipping', 'seo', 'paymentMethods'].forEach(field => {
        if (updateData[field]) {
            Object.keys(updateData[field]).forEach(key => {
                finalUpdate[`${field}.${key}`] = updateData[field][key];
            });
        }
    });

    const store = await Store.findOneAndUpdate({}, { $set: finalUpdate }, {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
    });

    console.log('UPDATED STORE DOCUMENT:', JSON.stringify(store, null, 2));
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
