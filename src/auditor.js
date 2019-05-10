/* eslint-disable no-console */
// Auditor program: receives music through orchestra protocol (multicast) and
// sends a list of active musicians to a client (tcp), on the same port.
// Usage: node auditor.js

// UDP datagram (core node package)
const dgram = require('dgram');
// For the TCP connection
const net = require('net');
// Moment.js for the right date format
const moment = require('moment');
// Our own protocol definition
const protocol = require('./orchestra-protocol');

/* ********************** UDP Server ************************** */
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
  if (!(activeMusicians.has(musician.uuid))) {
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

/* ********************** TCP Server ************************** */
// Create TCP server
const server = net.createServer();

// Listen on same port our other protocol uses
server.listen(protocol.PROTOCOL_PORT);

// Return active musicians summary
function summary() {
  const musiciansSummary = [];

  // Iterate through the orchestra
  activeMusicians.forEach((element, key) => {
    // Remove musicians that haven't been active for 5 seconds
    if (moment().unix() - element.activeLast > 5) {
      activeMusicians.delete(key);
    } else {
      // Add active musicians to summary of active musicians
      musiciansSummary.push({
        uuid: key,
        instrument: element.instrument,
        activeSince: element.activeSince,
      });
    }
  });

  return musiciansSummary;
}

// On each connection
server.on('connection', (tcpSocket) => {
  // Get summary and stringify it
  const payload = JSON.stringify(summary(), null, 4);

  tcpSocket.write(payload);
  tcpSocket.end('\r\n');
});
