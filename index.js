const SerialPort = require('serialport');

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

const mid = char(195);
const epid = char(255);

/**
 * Returns a message packet.
 * @param message The ASCII message. Max 12 chars sent.
 * @param chunkNum The offset for the message from 0-14. Default is 0.
 * @param reset Optional. If truthy, return packet that resets the sign.
 */
function createMPacket(message, chunkNum = 0, reset = false) {
  const pid = char(245);
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
 * Returns a trigger packet.
 */
function createTPacket() {
  const pid = char(245);
  const bodyLength = char(1);
  const packet = `${mid}${epid}${pid}${bodyLength}T`;
  const checksum = calcChecksum(packet);
  return `${packet}${checksum}`;
}

/**
 * Returns a packet that requests the status from the sign.
 */
function createStatusRequestPacket() {
  const pid = char(128);
  const mod = char(254);
  const midSigns = char(189);
  const packet = `${mid}${epid}${pid}${mod}${midSigns}`;
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

const upArrow = `~G${char(0b11100000-1)}${char(0b11111000-1)}${char(0b11111110-1)}${char(0b11111111-1)}${char(0b11111110-1)}${char(0b11111000-1)}${char(0b11100000-1)}${char(0)}`;
const downArrow = `~G${char(0b10000011-1)}${char(0b10001111-1)}${char(0b10111111-1)}${char(0b11111111-1)}${char(0b10111111-1)}${char(0b10001111-1)}${char(0b10000011-1)}${char(0)}`;
const degreeSymbol = `~G${char(0b10000010-1)}${char(0b10000101-1)}${char(0b10000010-1)}${char(0)}`;

(async () => {
  try {
    const port = await serialPortAsync('/dev/ttyUSB0');
    // Promisified port.write function:
    const writeAsync = (contents) => new Promise((resolve, reject) => {
      port.write(contents, 'ascii', err => err ? reject(err) : resolve());
    });

    let pkt;

    async function writeMessage(message) {
      console.log(`Writing message of length ${message.length}`);
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

    // await writeMessage(`~CAPPL 89.84${downArrow}-0.71`); // stock ticker example 1
    // await writeMessage(`~CAPPL 89.84${upArrow}+0.71`); // stock ticker example 2
    // await writeMessage(`~C12:45 pm 56${degreeSymbol}F cloudy`) // clock & temperature example
    await writeMessage('HELLO WORLD!!!');
    console.log('Packets sent');

    // port.on('data', data => {
    //   console.log('Data:', data)
    // });
    
    // // await sleep(2000);
    // while(true) {
    //   pkt = createStatusRequestPacket();
    //   // console.log('Sending GET STATUS packet');
    //   await writeAsync(pkt);
    //   await sleep(2000);
    // }

  } catch(e) {
    console.error('An error occurred:', e);
  }
})();
