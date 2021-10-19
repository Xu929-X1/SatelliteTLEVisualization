const fs = require('fs');
//note that some satellite data gives you false
//NOTE: test for 10 min update, also care about task queue
module.exports = exports = function roundDown(data){
    for(let satellite in data){
        let infoCollection = Object.keys(data[satellite]);
        infoCollection.forEach((key)=>{
            const {x, y, z} = data[satellite][key];
            data[satellite][key].x = x.toFixed(3);
            data[satellite][key].y = y.toFixed(3);
            data[satellite][key].z = z.toFixed(3);
        });
    }    
    console.log('round down the v and p to 3 decimal points');
    fs.writeFile('dataToUse.json', JSON.stringify(data), (err)=>{
        if(err) console.log(err);
    });
};