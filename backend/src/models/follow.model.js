const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    foodPartnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'foodpartner',
        required: true
    }
}, {
    timestamps: true
});

// Ensure a user can only follow a food partner once
followSchema.index({ userId: 1, foodPartnerId: 1 }, { unique: true });

const followModel = mongoose.model('follow', followSchema);

module.exports = followModel;
