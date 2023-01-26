const fs = require('fs');

const data = fs.readFileSync('./data.json');
const holodata = fs.readFileSync('./horodata.json');

try {
    const globalqueue = JSON.parse(data, reviver);
    const holomap = JSON.parse(holodata, reviver);
    // const globalqueue = new Map();
    module.exports = { globalqueue, holomap };
} catch (err) {
    console.error(err);
}

function reviver(key, value) {
    if (typeof value === 'object' && value !== null) {
        if (value.dataType === 'Map') {
            return new Map(value.value);
        }
    }
    return value;
}