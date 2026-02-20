const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

const hashPassword = async (plainPassword) => {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hashedPassword;
  } catch (err) {
    console.log("Error hashing password", err);
    throw err;
  }
};

//function to compare password with hash password

const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (err) {
    console.log("Error comparing password", err);
    throw err;
  }
};

module.exports = { hashPassword, comparePassword };
