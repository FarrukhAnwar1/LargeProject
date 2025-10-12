const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// Create Schema
const CardSchema = new Schema({
    UserId: {
        type: Number
    },
    Card: {
        type: String,
        required: true
    }
});
const Card = mongoose.model("Card", CardSchema, "Cards");
module.exports = Card;