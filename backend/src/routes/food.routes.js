const express = require('express');
const foodController = require('../controllers/food.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const router = express.Router();
const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),

})

// POST /api/food/ [protected]
router.post('/',
    authMiddleware.authFoodPartnerMiddleware,
    upload.single("video"),
    foodController.createFood);

/*GET /api/food/ [protected] */
router.get('/',
    authMiddleware.authUserMiddleware,
    foodController.getFoodItems)

router.get(
    '/analytics',
    authMiddleware.authFoodPartnerMiddleware,
    foodController.getAnalytics
)

router.get('/mine',
    authMiddleware.authFoodPartnerMiddleware,
    foodController.getMyFoodItems)

router.post('/like',
    authMiddleware.authUserMiddleware,
    foodController.likeFood
);

router.post('/save',
    authMiddleware.authUserMiddleware,
    foodController.saveFood
);

router.get('/save',
    authMiddleware.authUserMiddleware,
    foodController.getSaveFood
);

router.get('/:id/comments',
    foodController.getFoodComments
);

router.post('/:id/comments',
    authMiddleware.authUserMiddleware,
    foodController.addFoodComment
);

router.delete(
    '/:id/comments',
    authMiddleware.authFoodPartnerMiddleware,
    foodController.deleteComment
)

router.patch('/:id',
    authMiddleware.authFoodPartnerMiddleware,
    foodController.updateMyFoodItem
);

router.delete('/:id',
    authMiddleware.authFoodPartnerMiddleware,
    foodController.deleteMyFoodItem
);

module.exports = router;
