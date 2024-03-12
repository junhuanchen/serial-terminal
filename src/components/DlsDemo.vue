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

        <div>
            <br>
            <n-button @click="parseButton">Parse</n-button>
            <n-button @click="stepButton" :disabled="isButtonDisabled">Step</n-button>
            <n-button @click="runButton" :disabled="isButtonDisabled">Run</n-button>
            <br>
            <textarea ref="code_edit_ref" v-model="code_text" spellcheck="false" style="width: 100%; height: 200px;" >
            </textarea>
        </div>

    </n-card>
</template>

<script setup lang="ts">

import { ref, onMounted, getCurrentInstance } from 'vue';

var myInterpreter;
function initAlert(interpreter, globalObject) {
    var wrapper = function alert(text) {
        return window.alert(arguments.length ? text : '');
    };
    interpreter.setProperty(globalObject, 'alert',
        interpreter.createNativeFunction(wrapper));
    interpreter.setProperty(globalObject, 'log',
        interpreter.createNativeFunction(console.log));
    interpreter.setProperty(globalObject, 'setScsData',
        interpreter.createNativeFunction(Module.setScsData));
}

let isButtonDisabled = ref(true);
let code_text = ref("\
setScsData('scsWritePosEx', 2, 4000, 0, 0);\n\n\
setScsData('scsWritePosEx', 2, 1000, 0, 0);\n\n\
setScsData('scsWritePosEx', 2, 4000, 0, 0);\n\n\
setScsData('scsWritePosEx', 2, 3000, 0, 0);\n\n\
");

const parseButton = () => {
    console.log(code_text.value);
    myInterpreter = new Interpreter(code_text.value, initAlert);
    isButtonDisabled.value = false;
    // runButton();
}

const stepButton = () => {
    var stack = myInterpreter.getStateStack();
    if (stack.length) {
        var node = stack[stack.length - 1].node;
        var start = node.start;
        var end = node.end;
    }
    else {
        var start = 0;
        var end = 0;
    }
    createSelection(start, end);
    try {
        // var ok = myInterpreter.step();
        var ok = false;
        function nextStep() {
            ok = myInterpreter.step();
            if (ok) {
                setTimeout(nextStep, 10);
            }
        }
        nextStep();
    } catch (e) {
        console.log(e);
    } finally {
        if (!ok) {
            isButtonDisabled.value = true;
        }
    }
}

const runButton = () => {
    try {
        if (myInterpreter.run()) {
            // Async function hit.  There's more code to run.
            setTimeout(runButton, 100);
        }
    } catch (e) {
        console.log(e);
    } finally {
        // isButtonDisabled.value = true;
    }
}

const code_edit_ref=ref();
function createSelection(start, end) {
    // console.log(code_edit_ref.value);
    if (code_edit_ref.value.createTextRange) {
        var selRange = code_edit_ref.value.createTextRange();
        selRange.collapse(true);
        selRange.moveStart('character', start);
        selRange.moveEnd('character', end);
        selRange.select();
    } else if (code_edit_ref.value.setSelectionRange) {
        code_edit_ref.value.setSelectionRange(start, end);
    } else if (code_edit_ref.value.selectionStart) {
        code_edit_ref.value.selectionStart = start;
        code_edit_ref.value.selectionEnd = end;
    }
    code_edit_ref.value.focus();
}

</script>