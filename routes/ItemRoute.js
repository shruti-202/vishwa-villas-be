const express = require("express");
const router = express.Router();
const { createItem } = require("../controllers/ItemController");

router.post("/", createItem);

module.exports = router
