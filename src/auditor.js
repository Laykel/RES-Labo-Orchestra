/* eslint-disable no-console */
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
      activeSince: new Date().toJSON().slice(0, 19).replace(/[-T]/g, ':'),
      sourcePort: source.port,
    };
  }
});

// Send active musicians summary to client
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

  console.log(musiciansSummary);
}

// Every 5 seconds
setInterval(summary.bind(summary), 5000);
