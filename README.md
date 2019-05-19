# Node.js Script and TTL Serial to J1708 Converter Circuit Schematic for NXTP7X962M LED Sign

## Requirements
* Node.js
* Yarn
* Serial port

## Instructions
1. Edit serial port in index.js if yours is not ttyUSB0.
2. Run `yarn` to install dependencies into node_modules folder.
3. Run `yarn start` to run the script. Scrolls "HELLO WORLD!!!" across the sign.

## Circuit
* Can connect any TTL 3.3v serial port to the LED sign's J1708 port. For example:
  * Raspberry Pis
  * 3.3v Arduinos
  * USB to 3.3V TTL serial adapters
* Tested with one LED sign. Daisy chaining might be possible, YMMV.
* Parts and values are flexible.
  * Most any PNP transistor and power/signal/schottky diode should work.
  * Can substitute other values for the resistors as long as they are reasonable.
* circuitjs.txt can be imported at https://www.falstad.com/circuit/

## Circuit Explanation

The circuit does not meet the J1708 spec, it just sends 3.3v TTL serial to the
sign straight on one pin (A) and inverted on the other pin (B) with some inline
impedance. The goal was to be really simple, i.e. mostly resistors. It could
probably be done even simpler. The 10k resistor + diode combination near the RXD
is to protect the 3.3v pin since the sign tries to pull up pin A toward 5v. If
you adapt the circuit for 5v TTL serial, or if you have 5v tolerant input pins,
you don't need the 10k resistor + diode.
