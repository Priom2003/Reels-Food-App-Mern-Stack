const followModel = require('../models/follow.model');
const foodPartnerModel = require('../models/foodpartner.model');

// Follow a food partner
const followFoodPartner = async (req, res) => {
    try {
        const userId = req.user._id;
        const { foodPartnerId } = req.params;

        // Check if already following
        const existingFollow = await followModel.findOne({ userId, foodPartnerId });
        if (existingFollow) {
            return res.status(400).json({ message: 'Already following this food partner' });
        }

        // Create follow relationship
        const follow = await followModel.create({ userId, foodPartnerId });

        // Increment followers count on food partner
        await foodPartnerModel.findByIdAndUpdate(foodPartnerId, { $inc: { followersCount: 1 } });

        res.status(201).json({ success: true, follow, message: 'Successfully followed' });
    } catch (error) {
        console.error('Error following food partner:', error);
        res.status(500).json({ error: error.message });
    }
};

// Unfollow a food partner
const unfollowFoodPartner = async (req, res) => {
    try {
        const userId = req.user._id;
        const { foodPartnerId } = req.params;

        // Delete follow relationship
        const follow = await followModel.findOneAndDelete({ userId, foodPartnerId });

        if (!follow) {
            return res.status(404).json({ message: 'Not following this food partner' });
        }

        // Decrement followers count on food partner
        await foodPartnerModel.findByIdAndUpdate(foodPartnerId, { $inc: { followersCount: -1 } });

        res.status(200).json({ success: true, message: 'Successfully unfollowed' });
    } catch (error) {
        console.error('Error unfollowing food partner:', error);
        res.status(500).json({ error: error.message });
    }
};

// Check if user follows a food partner
const checkFollowStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        const { foodPartnerId } = req.params;

        const follow = await followModel.findOne({ userId, foodPartnerId });

        res.status(200).json({
            isFollowing: !!follow
        });
    } catch (error) {
        console.error('Error checking follow status:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get user's followed food partners
const getUserFollowing = async (req, res) => {
    try {
        const userId = req.user._id;

        const followedFoodPartners = await followModel
            .find({ userId })
            .populate('foodPartnerId', 'name avatar email followersCount')
            .sort({ createdAt: -1 });

        res.status(200).json({
            foodPartners: followedFoodPartners.map(f => f.foodPartnerId)
        });
    } catch (error) {
        console.error('Error fetching following list:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get followers of a food partner (for food partner view)
const getFoodPartnerFollowers = async (req, res) => {
    try {
        const { foodPartnerId } = req.params;

        const followers = await followModel
            .find({ foodPartnerId })
            .populate('userId', 'fullName email')
            .sort({ createdAt: -1 });

        const followerCount = await followModel.countDocuments({ foodPartnerId });

        res.status(200).json({
            followers: followers.map(f => f.userId),
            followerCount
        });
    } catch (error) {
        console.error('Error fetching followers:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get followers for authenticated food partner
const getMyFollowers = async (req, res) => {
    try {
        const foodPartnerId = req.foodPartner._id;

        const followers = await followModel
            .find({ foodPartnerId })
            .populate('userId', 'fullName email')
            .sort({ createdAt: -1 });

        const followerCount = await followModel.countDocuments({ foodPartnerId });

        res.status(200).json({
            followers: followers.map(f => f.userId),
            followerCount
        });
    } catch (error) {
        console.error('Error fetching my followers:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    followFoodPartner,
    unfollowFoodPartner,
    checkFollowStatus,
    getUserFollowing,
    getFoodPartnerFollowers,
    getMyFollowers
};
