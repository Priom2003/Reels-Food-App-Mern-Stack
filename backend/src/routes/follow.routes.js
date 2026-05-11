const express = require('express');
const followController = require('../controllers/follow.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

// User routes (require user authentication)
router.post('/:foodPartnerId',
    authMiddleware.authUserMiddleware,
    followController.followFoodPartner);

router.delete('/:foodPartnerId',
    authMiddleware.authUserMiddleware,
    followController.unfollowFoodPartner);

router.get('/status/:foodPartnerId',
    authMiddleware.authUserMiddleware,
    followController.checkFollowStatus);

router.get('/user/following',
    authMiddleware.authUserMiddleware,
    followController.getUserFollowing);

// Food partner routes (for viewing their followers)
router.get('/food-partner/:foodPartnerId/followers',
    authMiddleware.authFoodPartnerMiddleware,
    followController.getFoodPartnerFollowers);

// Get authenticated food partner's followers
router.get('/me/followers',
    authMiddleware.authFoodPartnerMiddleware,
    followController.getMyFollowers);

module.exports = router;
