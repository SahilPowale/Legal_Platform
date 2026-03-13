const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    title: { 
        type: String, 
        default: 'New Legal Query' 
    },
    messages: [{
        id: { type: String }, // To keep frontend React keys stable
        text: { type: String, required: true },
        sender: { type: String, enum: ['user', 'ai'], required: true },
        timestamp: { type: String }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Chat', chatSchema);