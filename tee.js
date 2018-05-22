'use strict';

const { Duplex } = require('stream');

class Tee extends Duplex {
    constructor(sock, options) {
        super(options);
        this._sock = sock;

        this._sock.on('data', (data) => {
            this.emit('rx', data);
            this.push(data);
        });
    }

    _write(chunk, encoding, callback) {
        this.emit('tx', chunk);
        this._sock.write(chunk, callback);
    }

    _read(size) {
    }
}

module.exports = Tee;
