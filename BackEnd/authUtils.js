const bcrypt = require('bcrypt');

const saltRounds = 10; 
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(saltRounds);
    return bcrypt.hash(password, salt);
};
const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};
module.exports = { hashPassword, comparePassword };
