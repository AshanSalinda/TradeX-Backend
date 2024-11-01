// const jwt = require('jsonwebtoken');
// const path = require('path');
// require('dotenv').config({path: path.join(__dirname, '.', '.env')});

// const verifyToken = (req, res, next) => {
//     const token = req.headers['authorization'];
//     if (!token) {
//         return res.status(403).send({ message: 'No token provided!' });
//     }

//     jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
//         if (err) {
//             return res.status(401).send({ message: 'Unauthorized!' });
//         }
//         req.userId = decoded.id;
//         req.userName = decoded.userName;
//         req.userRole = decoded.roles;
//         next();
//     });
// };


// const checkRole = (requiredRole) => {
//     return (req, res, next) => {
//         if (req.userRole !== requiredRole) {
//             return res.status(403).send({ message: 'Require ' + requiredRole + ' Role!' });
//         }
//         next();
//     };
// };

// module.exports = { verifyToken, checkRole };