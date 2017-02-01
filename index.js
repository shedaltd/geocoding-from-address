#!/usr/bin/env node
var fs = require('fs');
var https = require('https');
var csv =require('fast-csv');
var program = require('commander');
var querystring = require("querystring");

var sububrs = [];

program.arguments('<file>').action(function(file) {
    readFile(file)
}).parse(process.argv);

function readFile(file) {
    var stream = fs.createReadStream(file);

    var csvStream = csv()
        .on("data", function(data){
            sububrs.push({id:data[0], address: data[2]});
        })
        .on("end", function(){
            getGeo();
        });

    console.log("Start reading file...");
    stream.pipe(csvStream);
}

function getGeo() {
    for (var i = 0; i < sububrs.length; i++) {
        (
            function () {
                var _i = i;
                setTimeout(function () {
                    var url = 'https://maps.google.com/maps/api/geocode/json?'+querystring.stringify({address: sububrs[_i].address, key: 'AIzaSyD3jh46tgveH5e4D7hepU8Uice5wJk_bnQ'});

                    https.get(url, (response) => {
                        var body = '';
                        response.on('data', function(d) {
                            body += d;
                        });
                        response.on('end', function() {
                            var response = JSON.parse(body);
                            var result = response.results[0];
                            if (result) {
                                var lat = result.geometry.location.lat;
                                var long = result.geometry.location.lng;
                                console.log(sububrs[_i].id+","+sububrs[_i].address + "," + lat + "," + long);
                            }
                        });

                    }).on('error', (e) => {
                        console.error(e);
                    });
                }, i*200);
            }
        )()
    }
}