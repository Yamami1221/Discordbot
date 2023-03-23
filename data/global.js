const fs = require('fs');

if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}
if (!fs.existsSync('./data/data.json')) {
    fs.writeFileSync('./data/data.json', '{}', 'utf8');
}
if (!fs.existsSync('./data/horodata.json')) {
    fs.writeFileSync('./data/horodata.json', '{}', 'utf8');
}

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