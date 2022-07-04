
const jsonwebtoken = require('jsonwebtoken');

module.exports = jwt;

function jwt() {
    const { secret } = process.env.secretkey;
    return jsonwebtoken.sign({ secret, algorithms: ['HS256'] }.then({
        path: [
            // public routes that don't require authentication
            '/users/'
        ]
    }))
}
