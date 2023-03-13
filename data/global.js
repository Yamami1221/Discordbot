const fs = require('fs');
const flatted = require('flatted');

const data = fs.readFileSync('./data/data.json');
const holodata = fs.readFileSync('./data/horodata.json');

try {
    const globaldata = new Map(flatted.parse(JSON.parse(data)));
    const horomap = new Map(flatted.parse(JSON.parse(holodata)));
    module.exports = { globaldata, horomap };
} catch (err) {
    console.error(err);
}