'use strict';

exports.parse = function (hexTemp) {
    var err = {},
        temp = -1,
        dec;

    try {
        if (hexTemp === null || hexTemp === undefined) return temp;

        if (hexTemp.indexOf('|') !== -1)
            hexTemp = hexTemp.split('|')[0]; //Grab only the first temp value. Will not support multiple temperature sensors.

        if (hexTemp.length === 4) {
            dec = parseInt(hexTemp.substring(2, 4), 16).toString();

            if (dec.length === 1) dec = '0' + dec;

            temp = parseInt(hexTemp.substring(0, 2), 16).toString() + '.' + dec;
        } else if (hexTemp.length >= 6) {
            dec = parseInt(hexTemp.substring(4, 6), 16).toString();

            if (dec.length === 1) dec = '0' + dec;

            temp = parseInt(hexTemp.substring(2, 4), 16).toString() + '.' + dec;
        }

        if (Math.round(temp) === 0)
            temp = -1;
    } catch (error) {
        return hexTemp;
    }

    return temp;
};