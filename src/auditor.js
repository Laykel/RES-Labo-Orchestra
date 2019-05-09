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
  // Parse received JSON
  const musician = JSON.parse(msg);

  // Add musician to list if he isn't already
  if (!(musician.uuid in activeMusicians)) {
    activeMusicians[musician.uuid] = {
      instrument: musician.instrument,
      activeSince: moment().toISOString(),
      activeLast: moment().valueOf(),
      sourcePort: source.port,
    };
  } else {
    activeMusicians[musician.uuid].activeLast = moment().valueOf();
  }

  // Remove musician from list if he wasn't active
  if (moment().valueOf() - activeMusicians[musician.uuid].activeLast > 5) {
    activeMusicians.delete(musician.uuid);
  }
});

// Return active musicians summary
function summary() {
  const musiciansSummary = [];

  // Iterate through the keys in activeMusicians
  Object.keys(activeMusicians).forEach((key) => {
    musiciansSummary.push({
      uuid: key,
      instrument: activeMusicians[key].instrument,
      activeSince: activeMusicians[key].activeSince,
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
