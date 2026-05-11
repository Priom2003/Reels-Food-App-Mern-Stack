const foodModel = require('../models/food.model');
const storageService = require('../services/storage.service');
const likeModel = require('../models/likes.model');
const saveModel = require('../models/save.model');
const commentModel = require('../models/comment.model');
const { v4: uuid } = require("uuid");


async function createFood(req, res) {

    const fileUploadResult = await storageService.uploadFile(req.file.buffer, uuid());

    const foodItem = await foodModel.create({
        name: req.body.name,
        description: req.body.description,
        video: fileUploadResult.url,
        foodPartner: req.foodPartner.id,
    })

    res.status(201).json({
        message: "Food item created successfully",
        food: foodItem
    })
}

async function getFoodItems(req, res) {

    const user = req.user;

    const {
        search = '',
        sort = '',
        page = 1,
        limit = 5
    } = req.query;

    const skip = (page - 1) * limit;

    // search query
    const query = {

        $or: [

            {
                name: {
                    $regex: search,
                    $options: 'i'
                }
            },

            {
                description: {
                    $regex: search,
                    $options: 'i'
                }
            }

        ]
    };

    // sorting
    let sortOption = {
        createdAt: 1
    };

    if (sort === 'latest') {

        sortOption = {
            createdAt: -1,
            _id: -1
        };
    }

    else if (sort === 'likes') {

        sortOption = {
            likeCount: -1
        };
    }

    else if (sort === 'saves') {

        sortOption = {
            savesCount: -1
        };
    }

    else if (sort === 'comments') {

        sortOption = {
            commentsCount: -1
        };
    }

    // fetch reels
    let foodItems = await foodModel
        .find(query)
        .populate('foodPartner')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit));

    // food ids
    const foodIds = foodItems.map(
        (item) => item._id
    );

    // liked + saved reels
    const [likedFoods, savedFoods] = await Promise.all([

        likeModel.find({
            user: user._id,
            food: { $in: foodIds }
        }).select('food'),

        saveModel.find({
            user: user._id,
            food: { $in: foodIds }
        }).select('food')

    ]);

    // liked ids set
    const likedFoodIds = new Set(

        likedFoods.map((item) =>
            item.food.toString()
        )

    );

    // saved ids set
    const savedFoodIds = new Set(

        savedFoods.map((item) =>
            item.food.toString()
        )

    );

    // attach states
    foodItems = foodItems.map((item) => ({

        ...item.toObject(),

        isLiked: likedFoodIds.has(
            item._id.toString()
        ),

        isSaved: savedFoodIds.has(
            item._id.toString()
        )

    }));

    // AI RECOMMENDED
    const recommendedItems = [...foodItems]

        .map((item) => {

            let recommendationScore =

                (item.likeCount || 0) * 1 +

                (item.savesCount || 0) * 2 +

                (item.commentsCount || 0) * 3;

            // boost liked reels
            if (item.isLiked) {
                recommendationScore += 25;
            }

            // boost saved reels
            if (item.isSaved) {
                recommendationScore += 40;
            }

            return {

                ...item,

                recommendationScore
            };
        })

        .sort(
            (a, b) =>
                b.recommendationScore -
                a.recommendationScore
        )

        .slice(0, 5);

    const totalReels = await foodModel.countDocuments(query)

    res.status(200).json({
        message: "Food items fetched successfully",
        foodItems,
        recommendedItems,

        hasMore:
            skip + foodItems.length < totalReels

    });
}

async function getMyFoodItems(req, res) {
    const foodItems = await foodModel
        .find({ foodPartner: req.foodPartner._id })
        .sort({ _id: -1 })

    res.status(200).json({
        message: "Food partner items fetched successfully",
        foodItems
    })
}

async function updateMyFoodItem(req, res) {
    const { id } = req.params;
    const updates = {};

    if (typeof req.body.name === "string") {
        updates.name = req.body.name.trim();
    }

    if (typeof req.body.description === "string") {
        updates.description = req.body.description.trim();
    }

    if (updates.name === "") {
        return res.status(400).json({ message: "Food name is required" });
    }

    const foodItem = await foodModel.findOneAndUpdate(
        { _id: id, foodPartner: req.foodPartner._id },
        updates,
        { new: true, runValidators: true }
    )

    if (!foodItem) {
        return res.status(404).json({ message: "Food item not found" });
    }

    res.status(200).json({
        message: "Food item updated successfully",
        food: foodItem
    })
}

async function deleteMyFoodItem(req, res) {
    const { id } = req.params;

    const foodItem = await foodModel.findOneAndDelete({
        _id: id,
        foodPartner: req.foodPartner._id
    })

    if (!foodItem) {
        return res.status(404).json({ message: "Food item not found" });
    }

    await Promise.all([
        likeModel.deleteMany({ food: id }),
        saveModel.deleteMany({ food: id }),
        commentModel.deleteMany({ food: id })
    ])

    res.status(200).json({
        message: "Food item deleted successfully",
        food: foodItem
    })
}

async function getFoodComments(req, res) {
    const { id } = req.params;

    const comments = await commentModel
        .find({ food: id })
        .populate('user', 'fullName')
        .sort({ createdAt: -1 })

    res.status(200).json({
        message: "Food comments fetched successfully",
        comments: comments.map((comment) => ({
            _id: comment._id,
            text: comment.text,
            createdAt: comment.createdAt,
            user: {
                _id: comment.user?._id,
                fullName: comment.user?.fullName || "User"
            }
        }))
    })
}

async function addFoodComment(req, res) {
    const { id } = req.params;
    const text = typeof req.body.text === "string" ? req.body.text.trim() : "";

    if (!text) {
        return res.status(400).json({ message: "Comment is required" });
    }

    const foodItem = await foodModel.findById(id);
    if (!foodItem) {
        return res.status(404).json({ message: "Food item not found" });
    }

    const comment = await commentModel.create({
        user: req.user._id,
        food: id,
        text
    })

    await foodModel.findByIdAndUpdate(id, {
        $inc: { commentsCount: 1 }
    })

    await comment.populate('user', 'fullName');

    res.status(201).json({
        message: "Comment added successfully",
        comment: {
            _id: comment._id,
            text: comment.text,
            createdAt: comment.createdAt,
            user: {
                _id: comment.user?._id,
                fullName: comment.user?.fullName || "User"
            }
        }
    })
}

async function deleteComment(req, res) {

    const { id } = req.params;

    const comment = await commentModel.findById(id)
        .populate('food');

    if (!comment) {
        return res.status(404).json({
            message: "Comment not found"
        });
    }

    if (
        comment.food.foodPartner.toString() !==
        req.foodPartner._id.toString()
    ) {
        return res.status(403).json({
            message: "Unauthorized"
        });
    }

    await commentModel.findByIdAndDelete(id);

    await foodModel.findByIdAndUpdate(
        comment.food._id,
        {
            $inc: { commentsCount: -1 }
        }
    );

    res.status(200).json({
        message: "Comment deleted successfully"
    });
}

async function likeFood(req, res) {
    const { foodId } = req.body;

    const user = req.user;

    const isAlreadyLiked = await likeModel.findOne({
        user: user.id,
        food: foodId
    })

    if (isAlreadyLiked) {
        await likeModel.deleteOne({
            user: user.id,
            food: foodId
        })

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { likeCount: -1 }
        })

        return res.status(200).json({
            message: "Food unliked successfully"
        })
    }

    const like = await likeModel.create({
        user: user.id,
        food: foodId
    })

    await foodModel.findByIdAndUpdate(foodId, {
        $inc: { likeCount: 1 }
    })

    res.status(201).json({
        message: "Food liked successfully",
        like
    })
}

async function saveFood(req, res) {

    const { foodId } = req.body;
    const user = req.user;

    const isAlreadySaved = await saveModel.findOne({
        user: user.id,
        food: foodId
    })

    if (isAlreadySaved) {
        await saveModel.deleteOne({
            user: user.id,
            food: foodId
        })

        await foodModel.findByIdAndUpdate(foodId, {
            $inc: { savesCount: -1 }
        })

        return res.status(200).json({
            message: "Food unsaved successfully",
            save: null,
            saved: false
        })
    }

    const save = await saveModel.create({
        user: user.id,
        food: foodId
    })

    await foodModel.findByIdAndUpdate(foodId, {
        $inc: { savesCount: 1 }
    })

    res.status(201).json({
        message: "Food saved successfully",
        save,
        saved: true
    })

}

async function getSaveFood(req, res) {

    const user = req.user;

    const savedFoods = await saveModel
        .find({ user: user._id })
        .populate('food');

    if (!savedFoods || savedFoods.length === 0) {

        return res.status(200).json({
            message: "No saved foods found",
            savedFoods: []
        });
    }

    // all food ids from saved reels
    const foodIds = savedFoods.map(
        (item) => item.food?._id
    );

    // find liked foods of current user
    const likedFoods = await likeModel.find({
        user: user._id,
        food: { $in: foodIds }
    }).select('food');

    // create set of liked food ids
    const likedFoodIds = new Set(
        likedFoods.map((item) =>
            item.food.toString()
        )
    );

    // attach isLiked to each food
    const formattedSavedFoods = savedFoods.map((item) => ({

        ...item.toObject(),

        food: {
            ...item.food.toObject(),

            isLiked: likedFoodIds.has(
                item.food._id.toString()
            )
        }

    }));

    res.status(200).json({
        message: "Saved foods fetched successfully",
        savedFoods: formattedSavedFoods
    });

}

async function getAnalytics(req, res) {

    try {

        const foodPartnerId = req.foodPartner._id

        // fetch creator reels
        const reels = await foodModel.find({

            foodPartner: foodPartnerId

        })

        // totals
        const totalReels = reels.length

        const totalLikes = reels.reduce(

            (sum, reel) =>

                sum + (reel.likeCount || 0),

            0
        )

        const totalSaves = reels.reduce(

            (sum, reel) =>

                sum + (reel.savesCount || 0),

            0
        )

        const totalComments = reels.reduce(

            (sum, reel) =>

                sum + (reel.commentsCount || 0),

            0
        )

        // engagement
        const totalEngagement =

            totalLikes +
            totalSaves +
            totalComments

        const averageEngagement =

            totalReels > 0

                ? Math.round(
                    totalEngagement / totalReels
                )

                : 0

        // top reel
        let topReel = null

        if (reels.length > 0) {

            topReel = reels.reduce(

                (best, current) => {

                    const bestScore =

                        (best.likeCount || 0) +
                        (best.savesCount || 0) +
                        (best.commentsCount || 0)

                    const currentScore =

                        (current.likeCount || 0) +
                        (current.savesCount || 0) +
                        (current.commentsCount || 0)

                    return currentScore > bestScore
                        ? current
                        : best
                }

            )
        }

        res.status(200).json({

            totalReels,

            totalLikes,

            totalSaves,

            totalComments,

            averageEngagement,

            topReel

        })

    } catch (error) {

        console.error(error)

        res.status(500).json({

            message: 'Failed to fetch analytics'
        })
    }
}

module.exports = {
    createFood,
    getFoodItems,
    getMyFoodItems,
    updateMyFoodItem,
    deleteMyFoodItem,
    likeFood,
    saveFood,
    getSaveFood,
    getFoodComments,
    addFoodComment,
    deleteComment,
    getAnalytics
}
