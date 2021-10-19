const axios = require('axios');
const fs = require('fs');
const page = 26;
function getData() {
    for (let i = 1; i < page; i++) {
        axios.get(`http://tle.ivanstanojevic.me/api/tle?seach=starlink&page=${i}&page-size=100`).then(response => {
            if (!response) return;
            let temp = JSON.stringify(response.data.member);
            fs.writeFileSync('../data.json', temp, {'flag': 'a'});
        }).catch(err => {
            console.log(err);
        })
    }
};

getData();

// fs.writeFileSync('data.json', JSON.stringify(data));