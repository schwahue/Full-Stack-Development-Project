/*
Author: Hui Feng
Description: Create this to deal with the lack of conditional operators in handlebars

*/

module.exports = {
    if_Equal: function (x, y) {
         return (x == y ? true : false);
    },
};