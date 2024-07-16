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
    return res.status(401).json({
      statusCode: 401,
      error: "Invalid User",
    });
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
    return res.status(500).json({
      statusCode: 500,
      error: "Internal Server Error",
    });
  }
};

const getItems = async (req, res) => {
  try {
    const pageNo = req.query.page;
    const type = req.query.type;
    pageSize = 10;
    const skips = (pageNo - 1) * 10;

    const propertyAddList = await PropertyAdd.find({listType: type ? type : {$exists: true}})
      .sort({ _id: -1 })
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
    return res.status(500).json({
      statusCode: 500,
      error: "Internal Server Error",
    });
  }
};

const getItemDetails = async (req, res) => {
  const { token } = req.cookies;

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

    if (token) {
      jwt.verify(
        token,
        process.env.JWT_SECRET_KEY,
        async (err, userInfoDecoded) => {
          if (err) {
            return res.status(401).json({
              statusCode: 401,
              error: "Unauthenticated",
            });
          }
          userDoc = await UserModel.findById(userInfoDecoded.id);
          res.status(200).json({
            data: {
              ...propertyAdDoc._doc,
              edit:
                userDoc?._id?.toString() ==
                propertyAdDoc?.author?._id.toString(),
            },
          });
        }
      );
    } else {
      res.status(200).json({
        data: {
          ...propertyAdDoc._doc,
          edit: false,
        },
      });
    }
  } catch (err) {
    return res.status(400).json({
      statusCode: 400,
      error: "Something went Wrong",
    });
  }
};

const postLead = async (req, res) => {
  const token = req.cookies.token;
  const { itemId } = req.body;

  if (!token) {
    return res.status(401).json({
      statusCode: 401,
      error: "Invalid User",
    });
  }

  if (!itemId) {
    return res.status(401).json({
      statusCode: 401,
      error: "Invalid ItemId",
    });
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
      return res.status(401).json({
        statusCode: 401,
        error: "Already Interest has been send to the owner",
      });
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
    return res.status(401).json({
      statusCode: 401,
      error: "Something went wrong",
    });
  }
};

const editItem = async (req, res) => {
  const token = req.cookies.token;
  const { itemId } = req.params;

  if (!token) {
    return res.status(401).json({
      statusCode: 401,
      error: "Invalid User",
    });
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

  if (title?.length < 5 || title?.length > 100) {
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

  if (location?.length < 3 || location?.length > 100) {
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

  if (description?.length > 1000) {
    return res.status(400).json({
      statusCode: 400,
      error: "Description should be less than 1000 characters",
    });
  }

  if (imgList?.length > 10) {
    return res.status(400).json({
      statusCode: 400,
      error: "Maximum 10 images are allowed to be uploaded",
    });
  }

  try {
    jwt.verify(
      token,
      process.env.JWT_SECRET_KEY,
      async (err, userInfoDecoded) => {
        if (err) {
          return res.status(401).json({
            statusCode: 401,
            error: "Token Expired",
          });
        }
        const propertyAddDoc = await PropertyAdd.findById(itemId).populate(
          "author",
          ["name"]
        );
        if (!propertyAddDoc) {
          return res.status(400).json({
            statusCode: 400,
            error: "Invalid ItemId",
          });
        }

        if (!(userInfoDecoded.id === propertyAddDoc?.author?._id.toString())) {
          return res.status(403).json({
            statusCode: 403,
            error: "Permission Denied",
          });
        }
        propertyAddDoc.title = title;
        propertyAddDoc.location = location;
        propertyAddDoc.price = price;
        propertyAddDoc.description = description;
        propertyAddDoc.imgList = imgList;
        propertyAddDoc.listType = listType;
        propertyAddDoc.save();

        res.status(200).json({
          success: "Ad Updated",
          data: propertyAddDoc,
        });
      }
    );
  } catch (err) {
    return res.status(500).json({
      statusCode: 500,
      error: "Internal Server Error",
    });
  }
};

module.exports = { createItem, getItems, getItemDetails, postLead, editItem };
