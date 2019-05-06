// Simple UDP server

const dgram = require('dgram');

const protocol = require('./orchestra-protocol.js');

const socket = dgram.createSocket('udp6');
socket.bind(protocol.PROTOCOL_PORT, () => {
  console.log('Joining multicast group');
  socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
});

socket.on('message', (msg, source) => {
  console.log(`Data has arrived: ${msg}. Source port: ${source.port}.`);
});
