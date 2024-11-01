const jwt = require('jsonwebtoken');

module.exports = {
    name: 'checkRole',
    schema: {
        $id: 'http://express-gateway.io/plugins/checkRolePlugin/policies/checkRole.json',
        type: 'object',
        properties: {
            roles: {
                type: 'array',
                items: {
                    type: 'string'
                }
            }
        }
    },
    policy: (actionParams) => {
        return (req, res, next) => {
            console.log('Executing checkRole policy with params', actionParams);
            const token = req.headers['authorization']?.split(' ')[1];
            if (!token) {
                return res.status(403).json({ error: 'No token provided' });
            }

            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    return res.status(401).json({ error: 'Failed to authenticate token' });
                }

                req.user = decoded;
                console.log('req.user', req.user);

                if (!actionParams.roles.includes(req.user.roles)) {
                    return res.status(403).json({ error: 'Access denied' });
                }

                next();
            });
        };
    }
};
