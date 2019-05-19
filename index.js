const SerialPort = require('serialport');

const mid = char(195);
const epid = char(255);
const pid = char(245);

/** Promisified serial port. */
const serialPortAsync = (path) => new Promise((resolve, reject) => {
  const port = new SerialPort(path, {
    baudRate: 9600,
		dataBits: 8,
		stopBits: 1,
		parity: 'none',
		rtscts: false,
		xon: false,
		xoff: false,
		xany: false,
  }, err => err ? reject(err) : resolve(port));
});

/**
 * Async sleep function.
 * @param ms Amount to sleep in milliseconds.
 */
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Get the string character equivalent to the given code.
 * @param charCode The ASCII character code.
 */
function char(charCode) {
  return String.fromCharCode(charCode);
}

/**
 * Calculate the checksum for a packet.
 * @param packetStr The packet contents as a string.
 */
function calcChecksum(packetStr) {
  let sum = 0;
  for (let idx = 0; idx < packetStr.length; idx++) {
    sum = (sum + packetStr.charCodeAt(idx)) & 0xFF;
  }
  const checksum = (~sum + 1) & 0xFF;
  console.log(`Sanity check: ${sum + checksum}`)
  return char(checksum);
}

/**
 * Send a message packet.
 * @param message The ASCII message. Max 12 chars sent.
 * @param chunkNum The offset for the message from 0-14. Default is 0.
 * @param reset Optional. If truthy, return packet that resets the sign.
 */
function createMPacket(message, chunkNum = 0, reset = false) {
  const signNum = char(0); // 0=broadcast
  const lineNum = char(1); // should be 1 for single line signs
  const position = reset ? char(0) : char(((chunkNum + 1) << 4) | 0x1);
  const body = `M${signNum}${lineNum}${position}${message.substr(0, 12)}`;
  const bodyLength = char(body.length);
  const packet = `${mid}${epid}${pid}${bodyLength}${body}`;
  const checksum = calcChecksum(packet);
  return `${packet}${checksum}`;
}

/**
 * Send a trigger packet.
 */
function createTPacket() {
  const bodyLength = char(1);
  const packet = `${mid}${epid}${pid}${bodyLength}T`;
  const checksum = calcChecksum(packet);
  return `${packet}${checksum}`;
}

/**
 * Split a string into array of equal sized chunks. Max 13 chunks.
 * @param str Input string to split up.
 * @param len Desired length of each chunk in the resulting array. Default is 12.
 */
function chunk(str, len = 12) {
  return str.split(new RegExp(`(.{${len}})`)).filter(x => x).filter((_itm, idx) => idx < 13);
}

(async () => {
  try {
    const port = await serialPortAsync('/dev/ttyUSB0');
    // Promisified port.write function:
    const writeAsync = (contents) => new Promise((resolve, reject) => {
      port.write(contents, 'ascii', err => err ? reject(err) : resolve());
    });

    let pkt;

    async function writeMessage(message) {
      const chunks = chunk(message);
      console.log(chunks);
      for (let idx = 0; idx < chunks.length; idx++) {
        pkt = createMPacket(chunks[idx], idx);
        console.log(`Sending M packet`);
        await writeAsync(pkt);
      }
      pkt = createTPacket();
      console.log(`Sending T packet`);
      await writeAsync(pkt);
    }

    pkt = createMPacket('', 0, true); // reset
    console.log('Sending RESET packet');
    await writeAsync(pkt);
    await sleep(20); // must wait some time after a reset

    await writeMessage('HELLO WORLD!!!');
    console.log('Packets sent');
  } catch(e) {
    console.error('An error occurred:', e);
  }
})();
