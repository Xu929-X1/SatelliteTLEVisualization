const satellite = require('satellite.js');
const fs = require('fs');
module.exports = exports = function velocityCalc() {
    let res = {};
    fs.readFile('./starlink.json', 'utf-8', (err, data) => {
        if (err) console.log(err);
        data = JSON.parse(data)
        for (const singleData in data) {
            let tempRec = satellite.twoline2satrec(data[singleData]['l1'], data[singleData]['l2']);
            let posNVelo = satellite.propagate(tempRec, new Date());
            if(posNVelo && posNVelo.position){
                for(let item in posNVelo){
                    const {x, y, z} = posNVelo[item];
                    posNVelo[item]["x"] = x.toFixed(3);
                    posNVelo[item]["y"] = y.toFixed(3);
                    posNVelo[item]["z"] = z.toFixed(3);
                }
                res[singleData] = posNVelo;
            }
        }
        fs.writeFile('./rawPV.json', JSON.stringify(res), (err) => {
            if (err) console.log(err);
        })
    });
};