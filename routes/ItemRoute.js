const express = require("express");
const router = express.Router();
const { createItem, getItems, getItemDetails, postLead } = require("../controllers/ItemController");

router.post("/", createItem);
router.get("/", getItems);
router.get("/:itemId", getItemDetails)
router.post("/lead", postLead)

module.exports = router
