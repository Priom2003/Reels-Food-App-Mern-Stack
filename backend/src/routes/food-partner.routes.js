const express = require('express');
const foodPartnerController = require('../controllers/food-partner.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const multer = require('multer');

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage()
})

router.get("/me",
    authMiddleware.authFoodPartnerMiddleware,
    foodPartnerController.getMyProfile)

router.patch("/me",
    authMiddleware.authFoodPartnerMiddleware,
    upload.single("avatar"),
    foodPartnerController.updateMyProfile)

/*GET /api/food-partner/:id */
router.get("/:id",
    authMiddleware.authUserMiddleware,
    foodPartnerController.getFoodPartnerById)

module.exports = router;
