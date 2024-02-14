const mongoose = require("mongoose");

const LoginSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true
    },
    password: { 
        type: String, 
        required: true 
    },
});

const collection = mongoose.model("account", LoginSchema);

module.exports = collection;