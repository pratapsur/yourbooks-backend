const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Look for the VIP pass in the headers
    const token = req.header('Authorization');
    
    // If no pass, kick them out
    if (!token) return res.status(401).json({ error: 'Access denied. Please log in.' });

    try {
        // The token usually comes as "Bearer <token_string>", so we split it to get just the string
        const actualToken = token.split(" ")[1] || token;
        
        // Verify the token using our secret key
        const verified = jwt.verify(actualToken, process.env.JWT_SECRET);
        
        // Attach the user's ID to the request so we know WHO is asking for books
        req.user = verified; 
        
        // Let them into the club!
        next(); 
    } catch (error) {
        res.status(400).json({ error: 'Invalid or expired token.' });
    }
};

module.exports = authMiddleware;