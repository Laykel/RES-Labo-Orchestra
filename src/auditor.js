const dgram = require('dgram');

const protocol = require('./orchestra-protocol');

const socket = dgram.createSocket('udp6');

