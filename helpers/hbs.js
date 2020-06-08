const moment = require('moment');
module.exports = {
    formatDate: function (date, targetFormat) {
        return moment(date).format(targetFormat);
    },

    replaceEmptyString: function (mystr){
        if (mystr == "" || mystr == null){
            return '-';
        }
        else{
            return mystr;
        }
        //return mystr.replace(/,/g, ' | ')
    },

    radioCheck: function(value, radioValue){
        if (radioValue == value){
            return 'checked';
        }
    },
};