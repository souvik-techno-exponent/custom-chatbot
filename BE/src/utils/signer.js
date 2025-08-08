// signer.js - sign/embed payloads for widget
const jwt = require('jsonwebtoken');

function signEmbedPayload(payload, secret, expiresIn = '7d') {
    return jwt.sign(payload, secret, { expiresIn });
}

function verifyEmbedToken(token, secret) {
    return jwt.verify(token, secret);
}

module.exports = { signEmbedPayload, verifyEmbedToken };
