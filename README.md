# Node.js Script and Circuit for NXTP7X962M LED Signs

Control an LED sign with Node.js thru the serial port.

## Requirements
* Node.js
* Yarn or npm
* A 3.3V TTL serial port. Tested with CP2102 module.

## Instructions
1. Edit serial port in index.js if not ttyUSB0.
2. Run `yarn` or `npm install` to install dependencies.
3. Run `yarn start` or `npm start` to run. Puts "HELLO WORLD!!!" on the sign.

## Circuit
* Connects a TTL 3.3v serial port to the LED sign's J1708 port, e.g.:
  * Raspberry Pis
  * 3.3v Arduinos
  * USB to 3.3V TTL serial adapters. Tested with CP2102 module.
* If you just want to write to the sign, i.e. you don't care about receiving from the sign, the circuit is very simple: one 680 ohm resistor from TXD to A, and one 680 ohm resistor from +3.3V to B.
* Drives one LED sign. To daisy chain you need to modify the resistor divider, i.e. the ones with asterisks.
* circuitjs.txt can be imported at https://www.falstad.com/circuit/
