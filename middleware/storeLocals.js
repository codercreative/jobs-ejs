const storeLocals = (req, res, next) => {
  if (req.user) {
    res.locals.user = req.user
  } else {
    res.locals.user = null
  }
  res.locals.success_msg = req.flash("success_msg")
  res.locals.error_msg = req.flash("error_msg")
  res.locals.info = req.flash("info")
  res.locals.errors = req.flash("error")
  next()
}

module.exports = storeLocals