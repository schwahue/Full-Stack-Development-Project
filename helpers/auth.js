const alertMessage = require('./messenger'); // Bring in alert messenger

const ensureUserAuthenticated = (req, res, next) => {
    if (req.isAuthenticated() && req.user.type == 'customer') { // If user is authenticated
        return next(); // Calling next() to proceed to the next statement
    }
    // If not authenticated, show alert message and redirect to ‘/’
    alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
    res.redirect('/user/redirect');
};

const ensureMerchantAuthenticated = (req, res, next) => {
    if (req.isAuthenticated() && req.user.type == 'merchant') { // If user is authenticated
        return next(); // Calling next() to proceed to the next statement
    }
    // If not authenticated, show alert message and redirect to ‘/’
    alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
    res.redirect('/user/redirect');
};

const ensureAdminAuthenticated = (req, res, next) => {
    if (req.isAuthenticated() && req.user.type == 'admin') { // If user is authenticated
        return next(); // Calling next() to proceed to the next statement
    }
    // If not authenticated, show alert message and redirect to ‘/’
    alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
    console.log("ADMIN TYPE");
    console.log(req.user.type);
    res.redirect('/user/redirect');
};
module.exports = {ensureAdminAuthenticated, ensureMerchantAuthenticated, ensureUserAuthenticated};
