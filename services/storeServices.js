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

// Update store configuration - COMPLETE REWRITE for reliability
const updateStoreConfig = async (updateData) => {
    console.log('========== STORE UPDATE START ==========');
    console.log('Input updateData:', JSON.stringify(updateData, null, 2));

    // First, ensure we have a store document
    let store = await Store.findOne();
    if (!store) {
        console.log('No store document found, creating new one...');
        store = new Store({
            storeProfile: {
                name: "OpticsGlasses",
                email: "admin@opticsglasses.com"
            }
        });
        await store.save();
        console.log('Created new store document with _id:', store._id);
    }

    console.log('Store document _id:', store._id);
    console.log('BEFORE update - cms.promo:', JSON.stringify(store.cms?.promo, null, 2));

    // Apply updates using direct object assignment with explicit markModified
    // This is the most reliable way to update nested Mongoose documents
    
    if (updateData.storeProfile) {
        store.storeProfile = { ...store.storeProfile?.toObject?.() || store.storeProfile || {}, ...updateData.storeProfile };
        store.markModified('storeProfile');
        console.log('Updated storeProfile');
    }

    if (updateData.shipping) {
        store.shipping = { ...store.shipping?.toObject?.() || store.shipping || {}, ...updateData.shipping };
        store.markModified('shipping');
        console.log('Updated shipping');
    }

    if (updateData.seo) {
        store.seo = { ...store.seo?.toObject?.() || store.seo || {}, ...updateData.seo };
        store.markModified('seo');
        console.log('Updated seo');
    }

    if (updateData.paymentMethods) {
        store.paymentMethods = updateData.paymentMethods;
        store.markModified('paymentMethods');
        console.log('Updated paymentMethods');
    }

    // Handle CMS updates with special attention to nested promo object
    if (updateData.cms) {
        const existingCms = store.cms?.toObject?.() || store.cms || {};
        const newCms = updateData.cms;

        console.log('Existing CMS:', JSON.stringify(existingCms, null, 2));
        console.log('New CMS data:', JSON.stringify(newCms, null, 2));

        // Deep merge CMS object
        const mergedCms = {
            ...existingCms,
            ...newCms,
        };

        // Handle nested hero object
        if (newCms.hero) {
            mergedCms.hero = {
                ...(existingCms.hero || {}),
                ...newCms.hero
            };
        }

        // Handle nested promo object - THIS IS THE KEY FIX
        if (newCms.promo !== undefined) {
            mergedCms.promo = {
                ...(existingCms.promo || {}),
                ...newCms.promo
            };
            console.log('Merged promo:', JSON.stringify(mergedCms.promo, null, 2));
        }

        // Handle heroSlides array
        if (newCms.heroSlides !== undefined) {
            mergedCms.heroSlides = newCms.heroSlides;
        }

        // Handle featuredLimit
        if (newCms.featuredLimit !== undefined) {
            mergedCms.featuredLimit = newCms.featuredLimit;
        }

        store.cms = mergedCms;
        store.markModified('cms');
        console.log('Final merged CMS:', JSON.stringify(store.cms, null, 2));
    }

    // Save with error handling
    try {
        await store.save();
        console.log('Store saved successfully!');
    } catch (saveError) {
        console.error('Error saving store:', saveError);
        throw saveError;
    }

    // Re-fetch to confirm the save worked
    const savedStore = await Store.findById(store._id);
    console.log('AFTER save - cms.promo:', JSON.stringify(savedStore.cms?.promo, null, 2));
    console.log('========== STORE UPDATE END ==========');

    return savedStore;
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
