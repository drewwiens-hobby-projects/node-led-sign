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
