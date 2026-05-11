const foodPartnerModel = require('../models/foodpartner.model');
const foodModel = require('../models/food.model');
const storageService = require('../services/storage.service');
const {v4: uuid} = require("uuid");

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1754653099086-3bddb9346d37?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0Nnx8fGVufDB8fHx8fA%3D%3D";

async function getFoodPartnerById(req, res) {

    const foodPartnerId = req.params.id;

    const foodPartner = await foodPartnerModel.findById(foodPartnerId);
    const foodItemsByFoodPartner = await foodModel.find({ foodPartner: foodPartnerId})


    if(!foodPartner) {
        return res.status(404).json({ message: "Food Partner not found" });
    }

    res.status(200).json({
        message: "Food Partner retrieved successfully",
        foodPartner: {
            ...foodPartner.toObject(),
            avatar: foodPartner.avatar || DEFAULT_AVATAR,
            totalMeals: foodItemsByFoodPartner.length,
            foodItems: foodItemsByFoodPartner
        }
    });
}

async function getMyProfile(req, res) {
    const foodPartner = req.foodPartner;
    const totalMeals = await foodModel.countDocuments({ foodPartner: foodPartner._id });

    res.status(200).json({
        message: "Food partner profile fetched successfully",
        foodPartner: {
            _id: foodPartner._id,
            name: foodPartner.name,
            address: foodPartner.address,
            avatar: foodPartner.avatar || DEFAULT_AVATAR,
            totalMeals,
            followersCount: foodPartner.followersCount || 0
        }
    })
}

async function updateMyProfile(req, res) {
    const updates = {};

    if(typeof req.body.name === "string") {
        updates.name = req.body.name.trim();
    }

    if(typeof req.body.address === "string") {
        updates.address = req.body.address.trim();
    }

    if(req.file) {
        const fileUploadResult = await storageService.uploadFile(req.file.buffer, uuid());
        updates.avatar = fileUploadResult.url;
    }

    if(updates.name === "") {
        return res.status(400).json({ message: "Business name is required" });
    }

    if(updates.address === "") {
        return res.status(400).json({ message: "Address is required" });
    }

    const foodPartner = await foodPartnerModel.findByIdAndUpdate(
        req.foodPartner._id,
        updates,
        { new: true, runValidators: true }
    );

    const totalMeals = await foodModel.countDocuments({ foodPartner: foodPartner._id });

    res.status(200).json({
        message: "Food partner profile updated successfully",
        foodPartner: {
            _id: foodPartner._id,
            name: foodPartner.name,
            address: foodPartner.address,
            avatar: foodPartner.avatar || DEFAULT_AVATAR,
            totalMeals
        }
    })
}

module.exports = {
    getFoodPartnerById,
    getMyProfile,
    updateMyProfile
}
