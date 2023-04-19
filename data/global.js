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
if (!fs.existsSync('./data/model.nlp')) {
    fs.writeFileSync('./data/model.nlp', '', 'utf8');
}
if (!fs.existsSync('./data/roles66.json')) {
    fs.writeFileSync('./data/roles66.json', '{}', 'utf8');
}
if (!fs.existsSync('./data/nicknames66.json')) {
    fs.writeFileSync('./data/nicknames66.json', '{}', 'utf8');
}

const data = fs.readFileSync('./data/data.json');
const holodata = fs.readFileSync('./data/horodata.json');
const roles66 = fs.readFileSync('./data/roles66.json');
const nicknames66 = fs.readFileSync('./data/nicknames66.json');

try {
    const parsedData = JSON.parse(data);
    const parsedHoloData = JSON.parse(holodata);
    const parsedroles66 = JSON.parse(roles66);
    const parsednicknames66 = JSON.parse(nicknames66);
    const globaldata = new Map(Object.entries(parsedData));
    const horomap = new Map(Object.entries(parsedHoloData));
    const role66map = new Map(Object.entries(parsedroles66));
    const nickname66map = new Map(Object.entries(parsednicknames66));
    const datapath = './data/data.json';
    const horopath = './data/horodata.json';
    const nlppath = './data/model.nlp';
    const roles66path = './data/roles66.json';
    const nicknames66path = './data/nicknames66.json';
    module.exports = { globaldata, horomap, role66map, nickname66map, datapath, horopath, nlppath, roles66path, nicknames66path };
} catch (err) {
    console.error(err);
}