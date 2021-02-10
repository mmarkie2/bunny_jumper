
let metaServerModule=require('./public/metaServer')

var ip = require("ip");
console.dir ( ip.address() );

require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log('addr: ' + add);
})


let metaServer=new metaServerModule.MetaServer();












