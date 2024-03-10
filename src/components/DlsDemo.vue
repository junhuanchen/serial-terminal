<template>
    <n-card>
        <div class="options">

            <n-button id="download" hidden>Download output</n-button>
            <n-button id="clear" hidden>Clear output</n-button>

            <div class="info" hidden>
                <a id="polyfill_switcher"></a>
            </div>

            <n-button type="success" round id="search">Search</n-button>
            <n-button type="primary" tertiary round id="connect">Connect</n-button>

            <n-tag size="small" round for="ports">Port:</n-tag>

            <select id="ports">
                <option value="prompt">Click 'Connect' to add a port...</option>
            </select>

            <n-button hidden id="debug1">debug1</n-button>

            <n-button hidden id="debug2">debug2</n-button>

            <n-tag size="small" round for="baudrate">Baud rate:</n-tag>
            <select id="baudrate">
                <option value="9600">9600</option>
                <option value="14400">14400</option>
                <option value="19200">19220</option>
                <option value="28800">28800</option>
                <option value="38400">38400</option>
                <option value="57600">57600</option>
                <option value="115200">115200</option>
                <option value="230400">230400</option>
                <option value="460800">460800</option>
                <option value="500000" selected>500000</option>
                <option value="921600">921600</option>
                <option value="custom">Custom</option>
            </select>
            <input id="custom_baudrate" type="number" min="1" placeholder="Enter baudrate..." hidden>
            <n-tag size="small" round for="databits">Data bits:</n-tag>
            <select id="databits">
                <option value="7">7</option>
                <option value="8" selected>8</option>
            </select>
            <n-tag size="small" round for="parity">Parity:</n-tag>
            <select id="parity">
                <option value="none" selected>None</option>
                <option value="even">Even</option>
                <option value="odd">Odd</option>
            </select>
            <n-tag size="small" round for="stopbits">Stop bits:</n-tag>
            <select id="stopbits">
                <option value="1" selected>1</option>
                <option value="2">2</option>
            </select>
            <n-tag size="small" round for="rtscts">Hardware flow control</n-tag>
            <input id="rtscts" type="checkbox">
            <input hidden id="echo" type="checkbox">
            <n-tag hidden class="checkbox" for="echo">Local echo</n-tag>
            <input hidden id="enter_flush" type="checkbox">
            <n-tag hidden class="checkbox" for="enter_flush">Flush on enter</n-tag>
            <input hidden id="convert_eol" type="checkbox">
            <n-tag hidden class="checkbox" for="convert_eol">Convert EOL</n-tag>
            <input hidden id="autoconnect" type="checkbox">
            <n-tag hidden class="checkbox" for="autoconnect">Automatically connect</n-tag>

            <div id="terminal" hidden></div>

        </div>
    </n-card>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
    setup() {
        return {
            
        }
    }
})
</script>
