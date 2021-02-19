let metaServerModule = require('./js/metaServer')


require('dns').lookup(require('os').hostname(), function (err, add, fam) {
    console.log('addr: ' + add);
})


let metaServer = new metaServerModule.MetaServer();












