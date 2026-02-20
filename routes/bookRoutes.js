const express = require('express');
const router = express.Router();
const multer = require('multer');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const Book = require('../models/Book');
const User = require('../models/User');
const auth = require('../middleware/auth');

// --- 1. CONNECT TO YOUR AWS VAULT ---
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// --- 2. THE NEW CLOUD UPLOAD ENGINE ---
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        acl: 'public-read', // Makes the files readable so React can display them
        contentType: multerS3.AUTO_CONTENT_TYPE, 
        key: function (req, file, cb) {
            // Creates a unique name for the file in the cloud
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + '-' + file.originalname);
        }
    })
});

// --- 3. UPLOAD ROUTE (Now checking Quotas & Sending to Cloud) ---
router.post('/upload', auth, upload.fields([
    { name: 'pdfFile', maxCount: 1 }, 
    { name: 'coverImage', maxCount: 1 }
]), async (req, res) => {
    try {
        if (!req.files || !req.files['pdfFile']) {
            return res.status(400).json({ error: 'PDF file is required' });
        }

        // Check Quota Math
        const pdfSize = req.files['pdfFile'][0].size;
        const coverSize = req.files['coverImage'] ? req.files['coverImage'][0].size : 0;
        const totalNewSize = pdfSize + coverSize;

        const userBooks = await Book.find({ user: req.user.id });
        const currentUsage = userBooks.reduce((acc, book) => acc + (book.fileSize || 0), 0);
        
        const MAX_STORAGE = 100 * 1024 * 1024; // 100 MB Limit
        if (currentUsage + totalNewSize > MAX_STORAGE) {
            return res.status(400).json({ error: 'Storage limit exceeded! You only have 100MB of space.' });
        }

        // Grab the official Amazon S3 URLs! (Notice it is '.location', not '.path')
        const pdfS3Url = req.files['pdfFile'][0].location;
        const coverS3Url = req.files['coverImage'] ? req.files['coverImage'][0].location : '';

        const newBook = new Book({
            title: req.body.title || req.files['pdfFile'][0].originalname,
            pdfUrl: pdfS3Url,         // Saves the AWS Link
            coverImage: coverS3Url,   // Saves the AWS Link
            currentPage: 1,
            user: req.user.id,
            isPublic: req.body.isPublic === 'true',
            fileSize: totalNewSize
        });
        
        const savedBook = await newBook.save();
        res.status(201).json(savedBook);
    } catch (error) {
        console.error("AWS Upload Error:", error);
        res.status(500).json({ error: 'Failed to upload book to cloud' });
    }
});

// --- 4. GET ALL BOOKS ---
router.get('/', auth, async (req, res) => {
    try {
        const books = await Book.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

// --- 5. GET SINGLE BOOK (Social-Aware) ---
router.get('/:id', auth, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ error: 'Book not found' });

        const isOwner = book.user.toString() === req.user.id;

        if (isOwner) {
            return res.status(200).json({ ...book.toObject(), isOwner: true });
        }

        if (book.isPublic) {
            const me = await User.findById(req.user.id);
            if (me.friends.includes(book.user)) {
                return res.status(200).json({ ...book.toObject(), isOwner: false });
            }
        }

        res.status(403).json({ error: 'Unauthorized access to this book' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch book' });
    }
});

// --- 6. UPDATE PAGE PROGRESS ---
router.put('/:id/page', auth, async (req, res) => {
    try {
        const book = await Book.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { currentPage: req.body.currentPage },
            { new: true }
        );
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update page' });
    }
});

// --- 7. DELETE A BOOK ---
router.delete('/:id', auth, async (req, res) => {
    try {
        // (Optional for later: we can add code here to also delete the file from AWS so it frees up space, but for now, we just delete from the database!)
        const book = await Book.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!book) return res.status(404).json({ error: 'Book not found' });
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

module.exports = router;