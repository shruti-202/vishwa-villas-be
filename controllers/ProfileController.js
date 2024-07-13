const jwt = require("jsonwebtoken");
const PropertyAdd = require("../models/PropertyAddModel");
const UserModel = require("../models/UserModel");

const getProfile = async (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({
      statusCode: 401,
      error: "Please enter your Username",
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
            error: "Unauthenticated",
          });
        }
        const userDoc = await UserModel.findById(userInfoDecoded.id);
        const adList = await PropertyAdd.find({ author: userDoc._id });

        let adListResponse = [];
        for (const adItem of adList) {
          adListResponse.push({
            id: adItem._id,
            title: adItem.title,
            location: adItem.location,
            listType: adItem.listType,
            price: adItem.price,
            img: adItem.imgList[0],
          });
        }
        res.status(200).json({
          data: {
            profileDetails: {
              name: userDoc.name,
              email: userDoc.email,
              phone: userDoc.phone,
            },
            adList: adListResponse,
          },
        });
      }
    );
  } catch (err) {
    return res.status(401).json({
      statusCode: 401,
      error: "Something went Wrong",
    });
  }
};

module.exports = { getProfile };
