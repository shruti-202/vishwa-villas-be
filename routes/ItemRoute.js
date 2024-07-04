const express = require("express");
const router = express.Router();
const { createItem, getItems, getItemDetails, postLead, editItem } = require("../controllers/ItemController");

router.post("/", createItem);
router.get("/", getItems);
router.get("/:itemId", getItemDetails);
router.post("/lead", postLead);
router.put("/:itemId",editItem);


module.exports = router
