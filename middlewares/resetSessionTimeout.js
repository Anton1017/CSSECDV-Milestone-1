const resetSessionTimeout = (req, res, next) => {
    if (req.session) {
      req.session._garbage = Date();
      req.session.touch();
    }
    next();
};
module.exports = resetSessionTimeout  