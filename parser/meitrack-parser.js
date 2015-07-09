var _           = require('lodash'),
    moment      = require('moment'),
    fuelParser  = require('./meitrack-fuel'),
    tempParser  = require('./meitrack-temp');

exports.parse = function (rawData) {
    var data = {
        is_data: true
    };

    if (!/^\$\$/.test(rawData)){
        var err = {msg: 'Invalid Data', data: rawData};
        return err;
    }

    var parsedData = rawData.split('*')[0].split(',');

    _.extend(data, {
        header: parsedData[0],
        device: parsedData[1],
        message_type: parsedData[2],
        raw_data: rawData
    });

    if (data.message_type !== 'AAA') {
        parsedData = parsedData.splice(0, 3);
        _.extend(data, {
            is_data: false,
            message: parsedData.join()
        });

        return data;
    }

    _.extend(data, {
        event_code: parseInt(parsedData[3]),
        coordinates: [parseFloat(parsedData[5]), parseFloat(parsedData[4])],
        dtm: moment(parsedData[6], 'YYMMDDHHmmss').toDate(),
        status: parsedData[7],
        satellite_no: parseInt(parsedData[8]),
        signal: parseInt(parsedData[9]),
        speed: parseInt(parsedData[10]),
        direction: parseInt(parsedData[11]),
        accuracy: parseInt(parsedData[12]),
        altitude: parseInt(parsedData[13]),
        mileage: parseInt(parsedData[14]),
        run_time: parsedData[15],
        base_station: parsedData[16],
        io_status: parsedData[17],
        analog_input: parsedData[18]
    });

    var eventCode = data.event_code;

    if (eventCode === 37)
        data.rfid = parsedData[19];

    if (eventCode === 39)
        data.picture_name = parsedData[19];

    if (eventCode === 50 || eventCode === 51)
        data.temp_num = parsedData[19];

    if (eventCode === 20 || eventCode === 21 || eventCode === 58 || eventCode === 145)
        data.asst_event_info = parsedData[19];

    if (parsedData.length >= 21) {
        data.custom = parsedData[20];
        data.protocol = parsedData[21];

        if (data.protocol === '1') {
            if (parsedData.length === 24) {
                data.fuel_value = fuelParser.parse(parsedData[22]);
                data.temp = tempParser.parse(parsedData[23]);
            } else {
                if (parsedData[22].length === 4)
                    data.fuel_value = fuelParser.parse(parsedData[22]);
                else
                    data.temp = tempParser.parse(parsedData[22]);
            }
        }
    }

    return data;
};