/* eslint-disable no-console */
// Auditor program: receives music through given protocol (udp) and
// sends a list of active musicians to its client (tcp).
// Usage: node auditor.js

// UDP datagram (core node package)
const dgram = require('dgram');
// For the TCP connection
const net = require('net');
// Moment.js for the right date format
const moment = require('moment');
// Our own protocol definition
const protocol = require('./orchestra-protocol');

// Create a socket to send music
const socket = dgram.createSocket('udp4');

// Bind socket to multicast group
socket.bind(protocol.PROTOCOL_PORT, () => {
  console.log('Joining multicast group');
  socket.addMembership(protocol.PROTOCOL_MULTICAST_ADDRESS);
  console.log('Waiting for music.');
});

// Array of active musicians
const activeMusicians = new Map();

// Receive datagrams from the multicast group
socket.on('message', (msg, source) => {
  console.log(`Payload received: ${msg}\nFrom port: ${source.port}`);

  // Parse received JSON
  const musician = JSON.parse(msg);

  // Add musician to list if he isn't already
  if (!(musician.uuid in activeMusicians)) {
    activeMusicians.set(musician.uuid, {
      instrument: musician.instrument,
      activeSince: moment().toISOString(),
      activeLast: moment().unix(),
      sourcePort: source.port,
    });
  } else {
    // Else, just update his last appearance
    activeMusicians.get(musician.uuid).activeLast = moment().unix();
  }
});

// Return active musicians summary
function summary() {
  // Remove musicians that haven't been active for 5 seconds
  activeMusicians.forEach((element, key) => {
    if (moment().unix() - element.activeLast > 5) {
      activeMusicians.delete(key);
    }
  });

  const musiciansSummary = [];

  // Add active musicians to summary of active musicians
  activeMusicians.forEach((value, key) => {
    musiciansSummary.push({
      uuid: key,
      instrument: value.instrument,
      activeSince: value.activeSince,
    });
  });

  return musiciansSummary;
}

// Every 5 seconds
setInterval(summary.bind(), 5000);

// Send summary to TCP client
// Create TCP server
const server = net.createServer();

// Listen on same port our other protocol uses
server.listen(protocol.PROTOCOL_PORT);

// On each connection
server.on('connection', (tcpSocket) => {
  // Get summary and turn to payload
  const payload = Buffer.from(JSON.stringify(summary()));

  tcpSocket.write(payload);
  tcpSocket.write('\r\n');
  tcpSocket.end();
});
