const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    pdfUrl: { type: String, required: true },
    currentPage: { type: Number, default: 1 },
    coverImage: { type: String, default: '' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // --- NEW: Privacy Toggle ---
    isPublic: { type: Boolean, default: false }, // Defaults to private!
    fileSize: { type: Number, default: 0 }
    
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);