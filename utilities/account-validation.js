const utilities = require(".")
const accountModel = require("../models/account-model")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registrationRules = () => {
  return [
    // Validate first name
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a first name."),

    // Validate last name
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a last name."),

    // Validate email
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .isEmail()
      .normalizeEmail()
      .withMessage("A valid email is required.")
      .custom(async (account_email) => {
        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error("Email exists. Please log in or use a different email.");
        }
      }),

    // Validate password
    body("account_password")
      .trim()
      .notEmpty()
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Password does not meet requirements."),
  ];
};

/* ******************************
* Check data and return errors or continue to registration
* ***************************** */
validate.checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body
  let errors = []
  errors = validationResult(req)
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav()
    res.render("account/register", {
      errors,
      title: "Registration",
      nav,
      account_firstname,
      account_lastname,
      account_email,
    })
    return
  }
  next()
}


/*  **********************************
  *  Login Data Validation Rules
  * ********************************* */
validate.loginRules = () => {
  return [
    // Validate email
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Please provide a valid email address."),
    // Validate password
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage("Invalid password. Please try again."),
  ];
};


/* ******************************
 * Check data and return errors or continue to login
 * ***************************** */
validate.checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = [];
  errors = validationResult(req);
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("account/login", {
      errors,
      title: "Login",
      nav,
      account_email,
    });
    return;
  }
  next();
};

/*  **********************************
  *  Update Account Data Validation Rules
  * ********************************* */
validate.updateRules = () => {
  return [
    // Validate first name
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("First name is required.")
      .isLength({ min: 1 })
      .withMessage("First name must be at least 1 character long."),

    // Validate last name
    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Last name is required.")
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters long."),

    // Validate email
    body("account_email")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Email is required.")
      .isEmail()
      .withMessage("Please provide a valid email address.")
      .custom(async (account_email, { req }) => {

        const currentAccount = await accountModel.getAccountById(req.body.account_id);
       
        if (currentAccount && currentAccount.account_email === account_email) {
          return true; 
        }

        const emailExists = await accountModel.checkExistingEmail(account_email);
        if (emailExists && emailExists.account_id !== parseInt(req.body.account_id)) {
          throw new Error("Email already exists. Please use a different email.");
        }
      }),
  ];
};

/* ******************************
 * Check data and return errors or continue to update account
 * ***************************** */
validate.checkUpdateData = async (req, res, next) => {
  console.log("Middleware hit: checkUpdateData");
  const { account_firstname, account_lastname, account_email, account_id } = req.body;
  let errors = validationResult(req);
  console.log("Errors:", errors);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    res.render("account/update", {
      errors,
      title: "Update Account Information",
      nav,
      accountData: {
        account_firstname,
        account_lastname,
        account_email,
        account_id,
      },
    });
    return;
  }
  next();
};

/*  **********************************
  *  Update Password Validation Rules
  * ********************************* */
validate.updatePasswordRules = () => {
  return [
    // Validate password
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password is required.")
      .isStrongPassword({
        minLength: 12,
        minLowercase: 1,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 1,
      })
      .withMessage(
        "Password must be at least 12 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
      ),
  ];
};

/* ******************************
 * Check data and return errors or continue to update password
 * ***************************** */
validate.checkUpdatePasswordData = async (req, res, next) => {
  const { account_password, account_id } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    const nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(account_id);
    res.render("account/update", {
      errors,
      title: "Update Account Information",
      nav,
      accountData,
    });
    return;
  }
  next();
};

module.exports = validate