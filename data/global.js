const fs = require('fs');

const data = fs.readFileSync('./data/data.json');
const holodata = fs.readFileSync('./data/horodata.json');

try {
    const parsedData = JSON.parse(data);
    const parsedHoloData = JSON.parse(holodata);
    const globaldata = new Map(Object.entries(parsedData));
    const horomap = new Map(Object.entries(parsedHoloData));
    module.exports = { globaldata, horomap };
} catch (err) {
    console.error(err);
}