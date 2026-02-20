const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Book = require('../models/Book');
const auth = require('../middleware/auth'); // Our trusty Bouncer

// 1. SEARCH for users (Upgraded to check friendship status)
router.get('/search', auth, async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) return res.status(400).json({ error: 'Search query is required' });

        const me = await User.findById(req.user.id); // Get my profile to check my friends
        
        const users = await User.find({
            username: { $regex: query, $options: 'i' },
            _id: { $ne: req.user.id } 
        }).select('username _id friendRequests'); // Need friendRequests to check if I already sent one

        // Format the results so React knows exactly what buttons to show
        const results = users.map(user => ({
            _id: user._id,
            username: user.username,
            isFriend: me.friends.includes(user._id),
            isRequested: user.friendRequests.includes(me._id)
        }));

        res.status(200).json(results);
    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// 2. SEND a Friend Request
router.post('/request/:targetUserId', auth, async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.targetUserId);
        if (!targetUser) return res.status(404).json({ error: 'User not found' });

        // Prevent sending multiple requests or requesting someone who is already a friend
        if (targetUser.friendRequests.includes(req.user.id)) {
            return res.status(400).json({ error: 'Request already sent' });
        }
        if (targetUser.friends.includes(req.user.id)) {
            return res.status(400).json({ error: 'Already friends' });
        }

        // Push your ID into their "friendRequests" array and save
        targetUser.friendRequests.push(req.user.id);
        await targetUser.save();

        res.status(200).json({ message: 'Friend request sent!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to send request' });
    }
});

// 3. ACCEPT a Friend Request
router.post('/accept/:requesterId', auth, async (req, res) => {
    try {
        const me = await User.findById(req.user.id);
        const requester = await User.findById(req.params.requesterId);

        if (!me.friendRequests.includes(requester._id)) {
            return res.status(400).json({ error: 'No request found from this user' });
        }

        // 1. Remove them from my requests
        me.friendRequests = me.friendRequests.filter(id => id.toString() !== requester._id.toString());
        
        // 2. Add each other to the "friends" arrays
        me.friends.push(requester._id);
        requester.friends.push(me._id);

        // Save both profiles
        await me.save();
        await requester.save();

        res.status(200).json({ message: 'Friend request accepted!' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to accept request' });
    }
});

// 4. GET My Social Network (My Friends and My Pending Requests)
router.get('/network', auth, async (req, res) => {
    try {
        // We use .populate() to turn the raw ObjectIds into actual usernames!
        const me = await User.findById(req.user.id)
            .populate('friends', 'username _id')
            .populate('friendRequests', 'username _id');
            
        res.status(200).json({ 
            friends: me.friends, 
            requests: me.friendRequests 
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to load network' });
    }
});

// 5. GET a Friend's Public Books
router.get('/public-books/:friendId', auth, async (req, res) => {
    try {
        const me = await User.findById(req.user.id);
        
        // Security Check: Are you actually friends with this person?
        if (!me.friends.includes(req.params.friendId)) {
            return res.status(403).json({ error: 'You are not friends with this user' });
        }

        // Only fetch books that belong to them AND are marked as public
        const publicBooks = await Book.find({ 
            user: req.params.friendId, 
            isPublic: true 
        }).sort({ createdAt: -1 });

        res.status(200).json(publicBooks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch public books' });
    }
});

// 6. UNFRIEND a user
router.post('/unfriend/:friendId', auth, async (req, res) => {
    try {
        const me = await User.findById(req.user.id);
        const friend = await User.findById(req.params.friendId);

        if (!me || !friend) return res.status(404).json({ error: 'User not found' });

        // Remove each other's IDs from the friends arrays
        me.friends = me.friends.filter(id => id.toString() !== friend._id.toString());
        friend.friends = friend.friends.filter(id => id.toString() !== me._id.toString());

        await me.save();
        await friend.save();

        res.status(200).json({ message: 'Unfriended successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to unfriend' });
    }
});

module.exports = router;