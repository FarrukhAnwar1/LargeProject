const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const Schema = mongoose.Schema;

const CardSchema = new Schema({
    CardId: {
        type: Number,
        unique: true,
    },
    UserId: {
        type: Number,
        ref: "User",
        required: true,
    },
    Card: {
        type: String,
        required: true,
    },
}, { timestamps: true });

CardSchema.plugin(AutoIncrement, { inc_field: "CardId" });
const Card = mongoose.model("Card", CardSchema, "Cards");
module.exports = Card;
