/**
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {Terminal} from 'xterm';
import {FitAddon} from 'xterm-addon-fit';
import {WebLinksAddon} from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import {
  serial as polyfill, SerialPort as SerialPortPolyfill,
} from 'web-serial-polyfill';

declare let Module: any;

Module['serial_rx'] = [];
Module['serial_tx'] = [];
Module['serial_wk'] = false;

console.log('load scslib', Module);

import {App} from './main';
console.log('load vue3', App);

/**
 * Elements of the port selection dropdown extend HTMLOptionElement so that
 * they can reference the SerialPort they represent.
 */
declare class PortOption extends HTMLOptionElement {
  port: SerialPort | SerialPortPolyfill;
}

let portSelector: HTMLSelectElement;
let connectButton: HTMLButtonElement;
let searchButton: HTMLButtonElement;
let baudRateSelector: HTMLSelectElement;
let customBaudRateInput: HTMLInputElement;
let dataBitsSelector: HTMLSelectElement;
let paritySelector: HTMLSelectElement;
let stopBitsSelector: HTMLSelectElement;
let flowControlCheckbox: HTMLInputElement;
// let echoCheckbox: HTMLInputElement;
// let flushOnEnterCheckbox: HTMLInputElement;
// let autoconnectCheckbox: HTMLInputElement;

let portCounter = 1;
let port: SerialPort | SerialPortPolyfill | undefined;
let reader: ReadableStreamDefaultReader | ReadableStreamBYOBReader | undefined;

const urlParams = new URLSearchParams(window.location.search);
const usePolyfill = urlParams.has('polyfill');
const bufferSize = 8 * 1024; // 8kB

const term = new Terminal({
  scrollback: 10_000,
});

const fitAddon = new FitAddon();
term.loadAddon(fitAddon);

term.loadAddon(new WebLinksAddon());

// const encoder = new TextEncoder();
// const toFlush = '';
term.onData((data) => {
  console.log(data);
  // if (echoCheckbox.checked) {
  //   term.write(data);
  // }

  if (port?.writable == null) {
    console.warn(`unable to find writable port`);
    return;
  }

  const writer = port.writable.getWriter();

  // if (flushOnEnterCheckbox.checked) {
  //   toFlush += data;
  //   if (data === '\r') {
  //     writer.write(encoder.encode(toFlush));
  //     writer.releaseLock();
  //     toFlush = '';
  //   }
  // } else {
  //   writer.write(encoder.encode(data));
  // }

  // Uint8Array FF FF 01 02 01 FB
  // const buf = new Uint8Array(6);
  // buf[0] = 0xFF;
  // buf[1] = 0xFF;
  // buf[2] = 0x01;
  // buf[3] = 0x02;
  // buf[4] = 0x01;
  // buf[5] = 0xFB;
  // writer.write(buf);

  term.writeln('send:' + data);

  // data = "FF FF 01 02 01 FB" 转 Uint8Array
  const dataArr = data.split(' ').map((byte) => parseInt(byte, 16));
  const buf = new Uint8Array(dataArr);
  writer.write(buf);

  // writer.write(encoder.encode(data));

  writer.releaseLock();
});

/**
 * Returns the option corresponding to the given SerialPort if one is present
 * in the selection dropdown.
 *
 * @param {SerialPort} port the port to find
 * @return {PortOption}
 */
function findPortOption(port: SerialPort | SerialPortPolyfill):
    PortOption | null {
  for (let i = 0; i < portSelector.options.length; ++i) {
    const option = portSelector.options[i];
    if (option.value === 'prompt') {
      continue;
    }
    const portOption = option as PortOption;
    if (portOption.port === port) {
      return portOption;
    }
  }

  return null;
}

/**
 * Adds the given port to the selection dropdown.
 *
 * @param {SerialPort} port the port to add
 * @return {PortOption}
 */
function addNewPort(port: SerialPort | SerialPortPolyfill): PortOption {
  const portOption = document.createElement('option') as PortOption;
  // portOption.textContent = `Port ${portCounter++}`;

  // port.getInfo()
  const tmp = port.getInfo();
  console.log(tmp); // usbProductId 0x7523 usbVendorId 0x1a86 is CH34x

  // TypeError: Cannot read properties of undefined (reading 'toString')
  if (tmp.usbProductId != undefined && tmp.usbVendorId != undefined) {
    portOption.textContent = `Port ${portCounter++} pid 0x${tmp.usbProductId.toString(16)} vid 0x${tmp.usbVendorId.toString(16)}`;
  } else {
    portOption.textContent = `Port ${portCounter++}`;
  }

  portOption.port = port;
  portSelector.appendChild(portOption);

  if (portSelector.options.length > 1) {
    portSelector.selectedIndex = portSelector.options.length - 1;
  }
  return portOption;
}

/**
 * Adds the given port to the selection dropdown, or returns the existing
 * option if one already exists.
 *
 * @param {SerialPort} port the port to add
 * @return {PortOption}
 */
function maybeAddNewPort(port: SerialPort | SerialPortPolyfill): PortOption {
  const portOption = findPortOption(port);
  if (portOption) {
    return portOption;
  }

  return addNewPort(port);
}

/**
 * Download the terminal's contents to a file.
 */
// function downloadTerminalContents(): void {
//   if (!term) {
//     throw new Error('no terminal instance found');
//   }

//   if (term.rows === 0) {
//     console.log('No output yet');
//     return;
//   }

//   term.selectAll();
//   const contents = term.getSelection();
//   term.clearSelection();
//   const linkContent = URL.createObjectURL(
//       new Blob([new TextEncoder().encode(contents).buffer],
//           {type: 'text/plain'}));
//   const fauxLink = document.createElement('a');
//   fauxLink.download = `terminal_content_${new Date().getTime()}.txt`;
//   fauxLink.href = linkContent;
//   fauxLink.click();
// }

/**
 * Clear the terminal's contents.
 */
// function clearTerminalContents(): void {
//   if (!term) {
//     throw new Error('no terminal instance found');
//   }

//   if (term.rows === 0) {
//     console.log('No output yet');
//     return;
//   }

//   term.clear();
// }

/**
 * Sets |port| to the currently selected port. If none is selected then the
 * user is prompted for one.
 */
async function getSelectedPort(): Promise<void> {
  if (portSelector.value == 'prompt') {
    try {
      const serial = usePolyfill ? polyfill : navigator.serial;
      port = await serial.requestPort({});
    } catch (e) {
      return;
    }
    const portOption = maybeAddNewPort(port);
    portOption.selected = true;
  } else {
    const selectedOption = portSelector.selectedOptions[0] as PortOption;
    port = selectedOption.port;
  }
}

/**
 * @return {number} the currently selected baud rate
 */
function getSelectedBaudRate(): number {
  if (baudRateSelector.value == 'custom') {
    return Number.parseInt(customBaudRateInput.value);
  }
  return Number.parseInt(baudRateSelector.value);
}

/**
 * Resets the UI back to the disconnected state.
 */
function markDisconnected(): void {
  term.writeln('<DISCONNECTED>');
  portSelector.disabled = false;
  connectButton.textContent = 'Connect';
  connectButton.disabled = false;
  baudRateSelector.disabled = false;
  customBaudRateInput.disabled = false;
  dataBitsSelector.disabled = false;
  paritySelector.disabled = false;
  stopBitsSelector.disabled = false;
  flowControlCheckbox.disabled = false;
  port = undefined;
  (Module as any).serial_wk = true;
}

/**
 * Initiates a connection to the selected port.
 */
async function connectToPort(): Promise<void> {
  await getSelectedPort();
  if (!port) {
    return;
  }

  const options = {
    baudRate: getSelectedBaudRate(),
    dataBits: Number.parseInt(dataBitsSelector.value),
    parity: paritySelector.value as ParityType,
    stopBits: Number.parseInt(stopBitsSelector.value),
    flowControl:
        flowControlCheckbox.checked ? <const> 'hardware' : <const> 'none',
    bufferSize,

    // Prior to Chrome 86 these names were used.
    baudrate: getSelectedBaudRate(),
    databits: Number.parseInt(dataBitsSelector.value),
    stopbits: Number.parseInt(stopBitsSelector.value),
    rtscts: flowControlCheckbox.checked,
  };
  console.log(options);

  portSelector.disabled = true;
  connectButton.textContent = 'Connecting...';
  connectButton.disabled = true;
  baudRateSelector.disabled = true;
  customBaudRateInput.disabled = true;
  dataBitsSelector.disabled = true;
  paritySelector.disabled = true;
  stopBitsSelector.disabled = true;
  flowControlCheckbox.disabled = true;

  try {
    await port.open(options);
    term.writeln('<CONNECTED>');
    connectButton.textContent = 'Disconnect';
    connectButton.disabled = false;

    // const configResult = (Module as any).config(2, 4, 1.5);
    // console.log('config result: ' + configResult);

    if ((Module as any).serial_tx_timer) {
      clearInterval((Module as any).serial_tx_timer);
    }

    (Module as any).serial_tx_timer = setInterval(() => {
      if (port && port.writable) {
        // console.log('debug3');

        const writer = port.writable.getWriter();

        if ((Module as any).serial_tx.length > 0) {
          const buf = (Module as any).serial_tx.shift();
          // console.log('send:', buf);
          writer.write(buf);
        }

        writer.releaseLock();
      }
    }, 1);

    // (Module as any).unit_test();
    (Module as any).serial_wk = true;
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
      term.writeln(`<ERROR: ${e.message}>`);
    }
    markDisconnected();
    return;
  }

  while (port && port.readable) {
    try {
      try {
        reader = port.readable.getReader({mode: 'byob'});
      } catch {
        reader = port.readable.getReader();
      }

      let buffer = null;
      for (;;) {
        const {value, done} = await (async () => {
          if (reader instanceof ReadableStreamBYOBReader) {
            if (!buffer) {
              buffer = new ArrayBuffer(bufferSize);
            }
            const {value, done} =
                await reader.read(new Uint8Array(buffer, 0, bufferSize));
            buffer = value?.buffer;
            return {value, done};
          } else {
            return await reader.read();
          }
        })();

        if (value) {
          await new Promise<void>((resolve) => {
            // console.log('recv ', value);
            // term.write(value, resolve);
            // 转 16 进制输出
            // term.writeln('recv:' + new Uint8Array(value).reduce((acc, byte) => {
            //   return acc + byte.toString(16).padStart(2, '0') + ' ';
            // }, ''), resolve);
            (Module as any).serial_rx.push(Array.from(new Uint8Array(value)));
            resolve();
          });
        }
        if (done) {
          break;
        }
      }
    } catch (e) {
      console.error(e);
      await new Promise<void>((resolve) => {
        if (e instanceof Error) {
          term.writeln(`<ERROR: ${e.message}>`, resolve);
        }
      });
    } finally {
      if (reader) {
        reader.releaseLock();
        reader = undefined;
      }
    }
  }

  if (port) {
    try {
      await port.close();
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        term.writeln(`<ERROR: ${e.message}>`);
      }
    }

    markDisconnected();
  }
}

/**
 * Closes the currently active connection.
 */
async function disconnectFromPort(): Promise<void> {
  // Move |port| into a local variable so that connectToPort() doesn't try to
  // close it on exit.
  const localPort = port;
  port = undefined;

  if (reader) {
    await reader.cancel();
  }

  if (localPort) {
    try {
      await localPort.close();
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        term.writeln(`<ERROR: ${e.message}>`);
      }
    }
  }

  markDisconnected();
}

document.addEventListener('DOMContentLoaded', async () => {
  const terminalElement = document.getElementById('terminal');
  if (terminalElement) {
    term.open(terminalElement);
    fitAddon.fit();

    window.addEventListener('resize', () => {
      fitAddon.fit();
    });
  }

  // const downloadOutput =
  //   document.getElementById('download') as HTMLSelectElement;
  // downloadOutput.addEventListener('click', downloadTerminalContents);

  // const clearOutput = document.getElementById('clear') as HTMLSelectElement;
  // clearOutput.addEventListener('click', clearTerminalContents);

  portSelector = document.getElementById('ports') as HTMLSelectElement;

  searchButton = document.getElementById('search') as HTMLButtonElement;
  searchButton.addEventListener('click', () => {
    if (port) {
      disconnectFromPort();
    }
    portSelector.selectedIndex = 0;
    connectToPort();
  });

  connectButton = document.getElementById('connect') as HTMLButtonElement;
  connectButton.addEventListener('click', () => {
    if (port) {
      disconnectFromPort();
    } else {
      connectToPort();
    }
  });

  baudRateSelector = document.getElementById('baudrate') as HTMLSelectElement;
  baudRateSelector.addEventListener('input', () => {
    if (baudRateSelector.value == 'custom') {
      customBaudRateInput.hidden = false;
    } else {
      customBaudRateInput.hidden = true;
    }
  });

  customBaudRateInput =
      document.getElementById('custom_baudrate') as HTMLInputElement;
  dataBitsSelector = document.getElementById('databits') as HTMLSelectElement;
  paritySelector = document.getElementById('parity') as HTMLSelectElement;
  stopBitsSelector = document.getElementById('stopbits') as HTMLSelectElement;
  flowControlCheckbox = document.getElementById('rtscts') as HTMLInputElement;
  // echoCheckbox = document.getElementById('echo') as HTMLInputElement;
  // flushOnEnterCheckbox =
  //     document.getElementById('enter_flush') as HTMLInputElement;
  // autoconnectCheckbox =
  //     document.getElementById('autoconnect') as HTMLInputElement;

  // const convertEolCheckbox =
  //     document.getElementById('convert_eol') as HTMLInputElement;
  // const convertEolCheckboxHandler = () => {
  //   term.options.convertEol = convertEolCheckbox.checked;
  // };
  // convertEolCheckbox.addEventListener('change', convertEolCheckboxHandler);
  // convertEolCheckboxHandler();

  // const polyfillSwitcher =
  //     document.getElementById('polyfill_switcher') as HTMLAnchorElement;
  // if (usePolyfill) {
  //   polyfillSwitcher.href = './';
  //   polyfillSwitcher.textContent = 'Switch to native API';
  // } else {
  //   polyfillSwitcher.href = './?polyfill';
  //   polyfillSwitcher.textContent = 'Switch to API polyfill';
  // }

  const serial = usePolyfill ? polyfill : navigator.serial;
  const ports: (SerialPort | SerialPortPolyfill)[] = await serial.getPorts();
  ports.forEach((port) => addNewPort(port));
  connectToPort(); // 遍历完自动链接历史记录最后一个设备

  // These events are not supported by the polyfill.
  // https://github.com/google/web-serial-polyfill/issues/20
  if (!usePolyfill) {
    navigator.serial.addEventListener('connect', (event) => {
      const portOption = addNewPort(event.target as SerialPort);
      // if (autoconnectCheckbox.checked) {
      portOption.selected = true;
      connectToPort();
      // }
    });
    navigator.serial.addEventListener('disconnect', (event) => {
      const portOption = findPortOption(event.target as SerialPort);
      if (portOption) {
        portOption.remove();
      }
    });
  }
});

document.getElementById('debug1').addEventListener('click', () => {
  if (port) {
    console.log('debug1');

    // serial_wk
    (async () => {
      for (let i = 0; i < 10; i++) {
        console.log('scsPing', i, await Module.scsPing(i));
      }
    } )();

    // const writer = port.writable.getWriter();

    // // Uint8Array FF FF 01 0A 03 29 00 A0 0F 00 00 00 00 19
    // const buf = new Uint8Array(14);
    // buf[0] = 0xFF;
    // buf[1] = 0xFF;
    // buf[2] = 0x01;
    // buf[3] = 0x0A;
    // buf[4] = 0x03;
    // buf[5] = 0x29;
    // buf[6] = 0x00;
    // buf[7] = 0xA0;
    // buf[8] = 0x0F;
    // buf[9] = 0x00;
    // buf[10] = 0x00;
    // buf[11] = 0x00;
    // buf[12] = 0x00;
    // buf[13] = 0x19;
    // writer.write(buf);

    // writer.releaseLock();
  }
});

document.getElementById('debug2').addEventListener('click', () => {
  if (port) {
    console.log('debug2');

    const writer = port.writable.getWriter();

    // FF FF 01 09 03 2A 00 00 E8 03 00 00 DD
    const buf = new Uint8Array(13);
    buf[0] = 0xFF;
    buf[1] = 0xFF;
    buf[2] = 0x01;
    buf[3] = 0x09;
    buf[4] = 0x03;
    buf[5] = 0x2A;
    buf[6] = 0x00;
    buf[7] = 0x00;
    buf[8] = 0xE8;
    buf[9] = 0x03;
    buf[10] = 0x00;
    buf[11] = 0x00;
    buf[12] = 0xDD;
    writer.write(buf);

    writer.releaseLock();
  }
});
