# Node.js Script and Serial to J1708 Circuit for NXTP7X962M LED Signs

## Description
Drive an LED sign thru any serial port on your computer. Circuit provided for connecting the sign to any TTL (e.g. 5V or 3.3V) serial port, e.g. a USB to TTL serial adapter.

## Instructions
1. Edit serial port name in index.js if yours is not ttyUSB0. Use COM names in Windows, e.g. COM1.
2. Run `yarn` to install dependencies into node_modules folder.
3. Run `yarn start` to run the script. Shows "HELLO WORLD!!!" on the sign.

## Requirements
* Node.js
* Yarn
* 5V or 3.3V TTL serial port

## Circuit
* Connects any TTL serial port to the LED sign's J1708 port. For example:
  * USB to TTL serial adapters (e.g. with the Node script in this project)
  * Raspberry Pis
  * Arduinos
* Parts and values are flexible. Use whatever you have on hand:
  * Pretty much any power/signal/schottky diode should work.
  * You can substitute other values for the resistors as long as they are reasonably close.
* circuitjs.txt can be imported at https://www.falstad.com/circuit/
* Tested with one LED sign attached. Daisy chaining more than one sign might be possible with this circuit, YMMV.

## Circuit Explanation
The circuit fakes a differential serial signal to drive the sign's J1708 port, i.e. pin A and pin B. It holds pin B at roughly half the single-ended serial voltage -- the 1k resistor drops the voltage due to the sign's sink current at pin B -- while driving pin A from the TXD pin of a regular TTL serial port thru a 1k resistor. The 220 ohm resistor is just protection that limits the max current to/from the sign.

The 10k resistor and diode clip the voltage at RXD to VCC to protect the RXD port, e.g. for 3.3V serial devices which may not be 5V tolerant, since the sign tries to bring port A near 5V. If your RXD pin is 5V tolerant, you can replace the diode with a wire and omit the 10k resistor.
