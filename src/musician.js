// Musician program: sends music through given protocol
// Usage node musician.js instrument
// instrument := piano | trumpet | flute | violin | drum

// UDP datagram (core node package)
const dgram = require('dgram');
// Generate random uuid for musician
const uuid = require('uuid/v4');
// Our own protocol definition
const protocol = require('./orchestra-protocol');
// Create a socket to send music
const socket = dgram.createSocket('udp6');

// Map which sound is made by which instrument
const sound = {
  piano: 'ti-ta-ti',
  trumpet: 'pouet',
  flute: 'trulu',
  violin: 'gzi-gzi',
  drum: 'boum-boum',
};

// Main function
class Musician {
  // Musician constructor
  constructor(instrument) {
    this.musician = uuid();
    this.instrument = instrument;
    this.music = sound[instrument];
  }

  // Function that sends payload
  play() {
    const music = {
      musician: this.musician,
      instrument: this.instrument,
      sound: this.music,
    };

    const message = JSON.stringify(music);

    const payload = Buffer.from(message);
    // Send payload
    socket.send(payload, 0, payload.length, protocol.PROTOCOL_PORT,
      protocol.PROTOCOL_MULTICAST_ADDRESS, () => {
        console.log(`Sending payload: ${payload} via port ${socket.address().port}.`);
      });
  }
}

// Get instrument from command line argument
if (process.argv.length !== 3 || !(process.argv[2] in sound)) {
  throw new Error('Usage: node musician.js <instrument>');
}
const instrument = process.argv[2];

// Create musician
const musician = new Musician(instrument);

// Send music every second
setInterval(musician.play.bind(musician), 1000);
