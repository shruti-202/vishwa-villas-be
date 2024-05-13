const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.end("Vishwa villas backend is healthy");
});

module.exports = router;
