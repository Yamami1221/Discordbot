const fs = require('fs');

const data = fs.readFileSync('./data/data.json');
const holodata = fs.readFileSync('./data/horodata.json');

try {
    const globaldata = JSON.parse(data, reviver);
    const horomap = JSON.parse(holodata, reviver);
    // const globaldata = new Map();
    module.exports = { globaldata, horomap };
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