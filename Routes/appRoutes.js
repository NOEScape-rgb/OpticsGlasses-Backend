const express = require("express");
const router = express.Router();
const {unexpectedRouteController} = require("../controllers/appController");


router.use( unexpectedRouteController);



module.exports = router;