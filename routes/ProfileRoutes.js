const express = require("express");
const router = express.Router();
const { getProfile } = require("../controllers/ProfileController");

router.get("/", getProfile);

module.exports = router;
