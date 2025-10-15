const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    UserId: {
        type: Number,
        unique: true,
    },
    FirstName: {
        type: String,
        required: true,
    },
    LastName: {
        type: String,
        required: true,
    },
    Login: {
        type: String,
        required: true,
        unique: true,
    },
    Password: {
        type: String,
        required: true,
    },
}, { timestamps: true });

UserSchema.plugin(AutoIncrement, { inc_field: "UserId" });
const User = mongoose.model("User", UserSchema, "Users");
module.exports = User;
