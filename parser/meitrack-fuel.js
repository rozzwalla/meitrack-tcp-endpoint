'use strict';

exports.parse = function (hexFuel) {
    var err = {},
        fuel = -1,
        dec;

    try {
        if (hexFuel === null || hexFuel === undefined) return fuel;

        if (hexFuel.length === 1)
            fuel = -1;
        else if (hexFuel.length === 4) {
            dec = parseInt(hexFuel.substring(2, 4), 16).toString();

            if (dec.length === 1) dec = '0' + dec;

            fuel = parseInt(hexFuel.substring(0, 2), 16).toString() + '.' + dec;
        }

        if (Math.round(fuel) === 0)
            fuel = -1;
    } catch (error) {
        return hexFuel;
    }

    return fuel;
};