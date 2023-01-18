const fs = require('fs');

const data = fs.readFileSync('./data.json');

try {
    const globalqueue = JSON.parse(data, reviver);
    // const globalqueue = new Map();
    module.exports = { globalqueue };
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