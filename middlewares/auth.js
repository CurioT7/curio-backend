/**
 * Validates an email address using a regular expression.
 * @param {string} email - The email address to validate.
 * @returns {boolean} - True if the email address is valid, otherwise false.
 */ function validateEmail(email) {
  const emailRegex = /^[^\s@]+(?:\.[^\s@]+)*@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates a password against a regular expression pattern.
 * The password must contain at least one letter, one digit, and be at least 8 characters long.
 * @param {string} password - The password to validate.
 * @returns {boolean} - True if the password is valid, otherwise false.
 */
function validatePassword(password) {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  return passwordRegex.test(password);
}

module.exports = { validateEmail, validatePassword };
