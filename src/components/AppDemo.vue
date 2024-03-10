<template>
    <n-card>
        <n-collapse>
            <n-collapse-item title="数据图表" >
            <div>
                <n-button @click="SyncClick">
                    开始同步
                </n-button>
                <n-button @click="StopClick">
                    停止同步
                </n-button>
                <n-flex >
                    <div v-for="(value, key) in scsobjs" :key="key" style="width: 30%;">
                        <canvas v-if="value != -1" :id="key"></canvas>
                    </div>
                </n-flex>
            </div>
            </n-collapse-item>
        </n-collapse>
    </n-card>
</template>

<script setup lang="ts">

import { ref, reactive } from 'vue';
import Chart from 'chart.js/auto'

declare let Module: any;

// ================== 设备工作区间 ==================

const device_min = 1, device_max = device_min + 14;
let scsobjs = reactive({}); // 局部，会产生作用域问题
let scswork = false;
let scsexit = false;
let scsdata = {}; // 全局 read 数据
let scscall = []; // 全局 write 数据

async function findDevice() {
    if (scswork) {
        return scswork;
    }
    scswork = true;
    Module.config(10, 20, 30);
    for (let i = device_min; i < device_max; i++) {
        scsobjs["dev_id_" + i] = await Module.scsPing(i);
    }
}

const data_name = ["位置", "速度", "负载", "电压", "温度", "电流"];

async function getScsData(i) {
    
    try {
        while (scscall.length > 0) {
            let func = scscall[0][0];
            let args = scscall[0][1];
            let ret = await Module[func](...args);
            console.log('setScsData', func, args, ret);
            scscall.shift();
        }
    } catch (e) {
        console.log('setScsData', e);
        while (scscall.length > 0) {
            scscall.shift();
        }
    }
    // console.log('getScsData', i);
    let data = [];
    data.push(await Module.scsReadPos(i));
    data.push(await Module.scsReadSpeed(i));
    data.push(await Module.scsReadLoad(i));
    data.push(await Module.scsReadVoltage(i));
    data.push(await Module.scsReadTemper(i));
    data.push(await Module.scsReadCurrent(i));
    return data;
}

// Module.setScsData("scsWritePosEx", 2, 2047, 0, 0);
Module.setScsData = (func, ...args) => {
    // console.log('callCmd', func, args);
    scscall.push([func, args]);
}

async function runScsData(func_update) {
    if (!scswork) {
        return;
    }

    scsexit = false;
    Module.config(10, 20, 30); // 约等于 14sum*8data*10ms=1120ms

    while (!scsexit) {
        for (let key in scsobjs) {
            if (scsobjs[key] == -1) {
                continue;
            }
            let str_i = parseInt(key.split('_')[2]); // dev_id_i
            let i = parseInt(str_i);
            await getScsData(i).then((data) => {
                // console.log(key, data);
                scsdata[key] = data;
            });
        }
        func_update();
    }

    scswork = false;
}

async function stopScsData() {
    if (!scswork) {
        return;
    }
    scsexit = true;
    while (scswork) {
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve("stopScsData done");
            }, 1000);
        });
    }
}

// ================== 图表工作区间 ==================

let scsdevs = {}; // 全局图表
const data_limit = 32;

async function createChart() {

    console.log('scsobjs', scsobjs);
    console.log('scsdevs', scsdevs);

    for (let key in scsobjs) {
        if (scsobjs[key] != -1) {
            const ctx = document.getElementById(key);
            const config = {
                type: 'scatter',
                options: {
                    spanGaps: false, // enable for all datasets
                    normalized: true,
                    animation: false,
                    plugins: {
                        title: {
                            display: true,
                            text: '设备编号：' + key,
                        }
                    },
                    responsive: true, // 设置图表为响应式，根据屏幕窗口变化而变化
                    maintainAspectRatio: false, // 设置图表为不变形
                    aspectRatio: 1, // 设置图表宽高比
                    scales: {
                        x: {
                            display: false,
                        },
                        y: {
                            beginAtZero: true,
                            grace: 4095 / 2,
                            min: 0,
                            max: 4095,
                        },
                        myScale: {
                            // beginAtZero: true,
                            // grace: 4095 / 2,
                            position: 'right', // `axis` is determined by the position as `'y'`
                            min: -2047,
                            max: 2047,
                        }
                    },
                }
            };

            scsdevs[key] = new Chart(ctx, config);
        }
    }
}

async function deleteChart() {
    for (let key in scsdevs) {
        if (scsdevs[key] != -1) {
            scsdevs[key].destroy();
            scsdevs[key] = -1;
        }
    }
    scsdevs = [];
}

async function updateChart() {

    console.log(scsdata);
    console.log(new Date().getTime()); // 240ms 6*8 5ms

    for (let key in scsdata) {
        for (let j = 0; j < scsdata[key].length; j++) {
            if (!scsdevs[key].data.datasets[j]) {
                scsdevs[key].data.datasets.push({
                    type: 'line',
                    label: data_name[j],
                    data: [],
                });
            }

            if (scsdevs[key].data.datasets[j]) {
                if (scsdata[key][j] != -1) {
                    scsdevs[key].data.datasets[j].data.push(scsdata[key][j]);
                }
            }

            if (scsdevs[key].data.datasets[j].data.length > data_limit) {
                scsdevs[key].data.datasets[j].data.shift();
            }
        }
        scsdevs[key].data.labels.push(new Date().getTime());
        if (scsdevs[key].data.labels.length > data_limit) {
            scsdevs[key].data.labels.shift();
        }
        scsdevs[key].update();
    }
}

const SyncClick = () => {
    findDevice().then((is_work) => {
        if (is_work) return;
        createChart().then(() => {
            runScsData(updateChart).then(() => {
                deleteChart();
                console.log('runScsData done');
            });
        });
    });
}

const StopClick = () => {
    stopScsData().then(() => {
        console.log('stopScsData done');
    });
}

</script>
