/* eslint-disable no-console */
// Musician program: sends music through orchestra protocol
// Usage node musician.js instrument
// instrument := piano | trumpet | flute | violin | drum

// UDP datagram (core node package)
const dgram = require('dgram');
// Generate random uuid for musician
const uuid = require('uuid/v4');
// Our own protocol definition
const protocol = require('./orchestra-protocol');

// Map which sound is made by which instrument
const sound = {
  piano: 'ti-ta-ti',
  trumpet: 'pouet',
  flute: 'trulu',
  violin: 'gzi-gzi',
  drum: 'boum-boum',
};

// Create a socket to send music
const socket = dgram.createSocket('udp4');

// Main function
class Musician {
  // Musician constructor
  constructor(instrument) {
    this.uuid = uuid();
    this.instrument = instrument;
    this.music = sound[instrument];
  }

  // Function that sends payload
  play() {
    const music = {
      uuid: this.uuid,
      instrument: this.instrument,
      sound: this.music,
    };

    const payload = Buffer.from(JSON.stringify(music));

    // Send payload
    socket.send(payload, 0, payload.length, protocol.PROTOCOL_PORT,
      protocol.PROTOCOL_MULTICAST_ADDRESS, () => {
        console.log(`Sending payload: ${payload}\nvia port ${socket.address().port}.`);
      });
  }
}

// Get instrument from command line argument
if (process.argv.length !== 3) {
  throw new Error('Usage: node musician.js <instrument>');
} else if (!(process.argv[2] in sound)) {
  throw new Error('Instrument must be either piano, trumpet, flute, violin or drum');
}
const instrument = process.argv[2];

// Create musician
const musician = new Musician(instrument);

// Send music every second
setInterval(musician.play.bind(musician), 1000);
