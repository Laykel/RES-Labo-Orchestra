// Auditor program: receives music through given protocol (udp) and
// sends a list of active musicians to its client (tcp).
// Usage: node auditor.js

// UDP datagram (core node package)
const dgram = require('dgram');
// Our own protocol definition
const protocol = require('./orchestra-protocol');

// Create a socket to send music
const socket = dgram.createSocket('udp4');

// Bind socket to multicast group
socket.bind(protocol.PROTOCOL_PORT, () => {
  console.log('Joining multicast group');
  socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
  console.log('Waiting for data.');
});

socket.on('message', (msg, source) => {
  console.log(`Data has arrived: ${msg}. Source port: ${source.port}.`);
});
