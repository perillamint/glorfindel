'use strict';

const net = require('net');
const tls = require('tls');
const { Duplex } = require('stream');

const TLSTester = require('./tlstester.js');

const tlsTester = new TLSTester({
    target: {
        host: 'bamtoki.com',
        port: 443,
        sni: 'bamtoki.com'
    }
});

async function main() {
    const foo = await tlsTester.test('TLSv1_2_method');
    console.log(foo);
}

main();

//console.log(tlsconn);

//tlsconn.write('GET /');
