const fs = require('fs');
// const regex = /starlink/ig;
fs.readFile('./raw.json', (err, data) => {
    if (err) throw err;
    let temp = data.toString('utf-8');
    rawData = JSON.parse(temp);
    let formatted = new Object();
    for (let singleData of rawData) {
        // if (regex.test(singleData["name"])) {
        if(singleData["name"]){
            let thisData = {
                name: singleData["name"],
                l1: singleData["line1"],
                l2: singleData["line2"]
            }
            formatted[thisData.name] = thisData;
        }

    }
    fs.writeFile('../starlink.json', JSON.stringify(formatted), (err)=>{
        if(err) console.log(err);
    })
})