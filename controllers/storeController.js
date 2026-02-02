const storeServices = require("../services/storeServices");

// Get Store Config (Admin)
const getStoreConfigController = async (req, res) => {
    try {
        const store = await storeServices.getStoreConfig();
        res.status(200).json({
            isStatus: true,
            msg: "Store configuration retrieved successfully",
            data: store,
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || "Internal Server Error",
            data: null,
        });
    }
};

// Update Store Config (Admin)
const updateStoreConfigController = async (req, res) => {
    try {
        const store = await storeServices.updateStoreConfig(req.body);
        res.status(200).json({
            isStatus: true,
            msg: "Store configuration updated successfully",
            data: store,
        });
    } catch (error) {
        res.status(400).json({
            isStatus: false,
            msg: error.message || "Bad Request",
            data: null,
        });
    }
};

// Get Public Store Config (Frontend)
const getPublicStoreConfigController = async (req, res) => {
    try {
        const store = await storeServices.getPublicStoreConfig();
        res.status(200).json({
            isStatus: true,
            msg: "Store settings retrieved",
            data: store
        });
    } catch (error) {
        res.status(500).json({
            isStatus: false,
            msg: error.message || "Internal Server Error",
            data: null
        });
    }
}

module.exports = {
    getStoreConfigController,
    updateStoreConfigController,
    getPublicStoreConfigController
};
