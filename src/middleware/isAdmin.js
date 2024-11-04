// isAdmin.js
function isAdmin(req, res, next) {
    // Assuming `req.user` contains the user information
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Forbidden: You do not have admin rights.' });
}

module.exports = isAdmin;
