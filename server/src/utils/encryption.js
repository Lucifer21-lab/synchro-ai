const crypto = require('crypto');
const bcrypt = require('bcryptjs')

const algorithm = 'aes-256-cbc';
const secretKey = crypto
    .createHash('sha256')
    .update(String(process.env.ENCRYPTION_SECRET || 'fallback-secret-for-dev-only'))
    .digest();

exports.encrypt = (text) => {
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

exports.decrypt = (hash) => {
    const decipher = crypto.createDecipheriv(
        algorithm,
        secretKey,
        Buffer.from(hash.iv, 'hex')
    );

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(hash.content, 'hex')),
        decipher.final()
    ]);

    return decrypted.toString();
};

exports.hashPassword = async (password) => {
    return await bcrypt.hash(password, 10); // 10 is the salt rounds
};

exports.compareHash = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

exports.generateToken = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

exports.generateOTP = (length = 6) => {
    const digits = '0123456789';
    let OTP = '';
    for (let i = 0; i < length; i++) {
        // SECURITY FIX 4: Use crypto.randomInt
        // Math.random() is not cryptographically secure. crypto.randomInt is.
        OTP += digits[crypto.randomInt(0, 10)];
    }
    return OTP;
};