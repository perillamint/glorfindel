'use strict';

const net = require('net');
const tls = require('tls');
const EventEmitter = require('events');

const Tee = require('./tee.js');

class TLSTester extends EventEmitter {
    constructor(options) {
        super();
        this._running = false;

        // target = {host: <host>, port: <port>}
        this._target = options.target;
    }

    async test(secureProtocol) {
        return new Promise((ful, rej) => {
            const rawconn = new net.Socket();
            const tee = new Tee(rawconn);
            const teeRecord = [];
            let tlserror = null;

            tee.on('rx', (data) => {
                teeRecord.push({
                    timestamp: new Date().getTime(),
                    direction: 'RX',
                    data: data,
                });
            });

            tee.on('tx', (data) => {
                teeRecord.push({
                    timestamp: new Date().getTime(),
                    direction: 'TX',
                    data: data,
                });
            });

            tee.on('end', () => {
                rawconn.end();
            });

            rawconn.on('connect', () => {
                console.log('conn established!');
                const tlsconn = new tls.connect({
                    socket: tee,
                    servername: this._target.sni
                });

                tlsconn.on('secureConnect', () => {
                    console.log('Secure connection established!');
                    tlsconn.end();
                });

                tlsconn.on('error', (e) => {
                    console.log('Secure connection error');
                    tlserror = e;
                    rawconn.end();
                });

                tlsconn.on('end', () => {
                    rawconn.end();
                });
            });

            rawconn.on('error', (e) => {
                console.error(e);
                ful({
                    status: 'connecton failure',
                    commLog: [],
                    error: e,
                });
            });

            rawconn.on('end', () => {
                rawconn.end();
                ful({
                    status: tlserror ? 'tls failure' : 'success',
                    commLog: teeRecord,
                    error: tlserror ? tlserror : undefined,
                });
            });

            rawconn.connect({
                host: this._target.host,
                port: this._target.port,
            });

        });
    }
}

module.exports = TLSTester;
