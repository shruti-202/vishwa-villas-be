const { titleValidator, locationValidator } = require("../constants/Validators");
const jwt = require("jsonwebtoken");
const PropertyAdd = require("../models/PropertyAddModel");
const UserModel = require("../models/UserModel");
const sendEmail = require("../utility/email/email");
const { getBuyerEnquiryEmailBody } = require("../utility/email/emailTemplate");
const EnquiryMailModel = require("../models/EnquiryMailModel");

const createItem = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    res.status(401).json({ error: "Invalid User" });
    return;
  }

  const { title, location, price, description, imgList, listType } = req.body;

  if (!listType) {
    return res.status(400).json({
      statusCode: 400,
      error: "Please select List Type",
    });
  }

  if (!title) {
    return res.status(400).json({
      statusCode: 400,
      error: "Please enter Title",
    });
  }

  if (title.length < 5 || title.length > 100) {
    return res.status(400).json({
      statusCode: 400,
      error: "Title should be more than 5 and less than 100 Character",
    });
  }

  if (!titleValidator(title)) {
    return res.status(400).json({
      statusCode: 400,
      error:
        "Invalid Title Format: Starts with uppercase followed by either all uppercase/lowercase & cannot contain gibberish/special characters",
    });
  }

  if (!price) {
    return res.status(400).json({
      statusCode: 400,
      error: "Please enter the Price",
    });
  }

  if (price < 0 || price > 10000000000) {
    return res.status(400).json({
      statusCode: 400,
      error: "Price should be greater than 0 and less than 100,00,00,000",
    });
  }

  if (!location) {
    return res.status(400).json({
      statusCode: 400,
      error: "Please enter the location",
    });
  }

  if (location.length < 3 || location.length > 100) {
    return res.status(400).json({
      statusCode: 400,
      error:
        "Location length should be more than 3 and less than 100 character",
    });
  }

  if (!locationValidator(location)) {
    return res.status(400).json({
      statusCode: 400,
      error:
        "Invalid Location Format: Starts with uppercase followed by either all uppercase/lowercase & cannot contain gibberish/special characters",
    });
  }

  if (description.length > 1000) {
    return res.status(400).json({
      statusCode: 400,
      error: "Description should be less than 1000 characters",
    });
  }

  if (imgList.length > 10) {
    return res.status(400).json({
      statusCode: 400,
      error: "Maximum 10 images are allowed to be uploaded",
    });
  }

  try {
    const tokenInfo = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const propertyAddDoc = await PropertyAdd.create({
      title,
      location,
      price,
      description,
      imgList,
      listType,
      author: tokenInfo.id,
    });
    res.status(201).json({
      success: "Property Added Successfully",
      data: propertyAddDoc,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log(err);
  }
};

const getItems = async (req, res) => {
  try {
    const pageNo = req.query.page;
    pageSize = 10;
    const skips = (pageNo - 1) * 10;

    const propertyAddList = await PropertyAdd.find()
      .skip(skips)
      .limit(pageSize);
    let propertyAddListResponse = [];

    for (const propertyAddItem of propertyAddList) {
      propertyAddListResponse.push({
        title: propertyAddItem.title,
        location: propertyAddItem.location,
        price: propertyAddItem.price,
        listType: propertyAddItem.listType,
        imgList: propertyAddItem.imgList,
        createdAt: propertyAddItem.createdAt,
        id: propertyAddItem._id,
      });
    }
    res.status(200).json({
      data: propertyAddListResponse,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getItemDetails = async (req, res) => {
  const { itemId } = req.params;

  if (itemId === null || itemId === undefined || itemId.length === 0) {
    return res.status(400).json({
      statusCode: 400,
      error: "Invalid Item Id",
    });
  }

  try {
    const propertyAdDoc = await PropertyAdd.findById(itemId).populate(
      "author",
      ["name"]
    );
    res.status(200).json({
      data: propertyAdDoc,
    });
  } catch {
    return res.status(400).json({
      statusCode: 400,
      error: "Something went wrong",
    });
  }
};

const postLead = async (req, res) => {
  const token = req.cookies.token;
  const { itemId } = req.body;

  if (!token) {
    res.status(401).json({ error: "Invalid User" });
    return;
  }

  if (!itemId) {
    res.status(401).json({ error: "Invalid ItemId" });
    return;
  }

  try {
    const tokenInfo = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const buyerUserDoc = await UserModel.findById(tokenInfo.id);
    const propertyAdDoc = await PropertyAdd.findById(itemId);
    const sellerDocId = propertyAdDoc.author.toString();
    const sellerUserDoc = await UserModel.findById(sellerDocId);

    const enquiryMailDoc = await EnquiryMailModel.findOne({
      propertyAdId: itemId,
      buyerId: buyerUserDoc._id,
      sellerId: sellerUserDoc._id,
    });

    if (enquiryMailDoc) {
      res
        .status(401)
        .json({ error: "Already Interest has been send to the owner" });
      return;
    }

    sendEmail(
      sellerUserDoc.email,
      `An interested Lead for your property - Vishwa Villas`,
      getBuyerEnquiryEmailBody(
        sellerUserDoc.name,
        itemId,
        buyerUserDoc.name,
        buyerUserDoc.email,
        buyerUserDoc.phone
      )
    );

    const enquiryMailDocNew = await EnquiryMailModel.create({
      propertyAdId: itemId,
      buyerId: buyerUserDoc._id,
      sellerId: sellerUserDoc._id,
    });

    res.status(201).json({ success: "Interest shared with the owner" });
  } catch (err) {
    console.log("error", err);
    res.status(401).json({ error: "Something went wrong" });
    return;
  }
};

module.exports = { createItem, getItems, getItemDetails, postLead };
