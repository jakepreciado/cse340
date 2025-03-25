const validation = {};

/* ***************************
 *  Validate Classification Name
 * ************************** */
validation.checkClassificationName = (req, res, next) => {
  const { classification_name } = req.body;

  if (!classification_name || !/^[A-Za-z0-9]+$/.test(classification_name)) {
    req.flash("notice", "Classification name must contain only letters and numbers (no spaces or special characters).");
    return res.redirect("/inv/add-classification");
  }

  next();
};


module.exports = validation;