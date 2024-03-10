<template>
    <n-card>
        <n-collapse>
            <n-collapse-item title="数据图表">
                <div>
                    <n-button @click="SyncClick">
                        开始同步
                    </n-button>
                    <n-button @click="StopClick">
                        停止同步
                    </n-button>
                    <n-flex>
                        <div v-for="(value, key) in appobjs" :key="key" style="width: 30%;">
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
import { runScsData, stopScsData, findDevice, scsdata, scsobjs, scsname, scswork } from '../utils/scs';

let appobjs = reactive({});
let appdevs = {};

const data_limit = 32;

async function createChart() {
    Object.assign(appobjs, scsobjs);
    
    // document.getElementById(key) maybe be null just wait so stupid
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve("wait document.getElementById(key) ");
        }, 100);
    });

    for (let key in appobjs) {
        if (appobjs[key] != -1) {
            
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

            appdevs[key] = new Chart(ctx, config);
        }
    }
    
    // console.log('appobjs', appobjs);
    // console.log('appdevs', appdevs);
}

async function deleteChart() {
    for (let key in appdevs) {
        if (appdevs[key] != -1) {
            appdevs[key].destroy();
            appdevs[key] = -1;
        }
    }
    appdevs = [];
}

async function updateChart() {

    // console.log(scsdata);
    // console.log(new Date().getTime()); // 240ms 6*8 5ms

    for (let key in scsdata) {
        for (let j = 0; j < scsdata[key].length; j++) {
            if (!appdevs[key].data.datasets[j]) {
                appdevs[key].data.datasets.push({
                    type: 'line',
                    label: scsname[j],
                    data: [],
                });
            }

            if (appdevs[key].data.datasets[j]) {
                if (scsdata[key][j] != -1) {
                    appdevs[key].data.datasets[j].data.push(scsdata[key][j]);
                }
            }

            if (appdevs[key].data.datasets[j].data.length > data_limit) {
                appdevs[key].data.datasets[j].data.shift();
            }
        }
        appdevs[key].data.labels.push(new Date().getTime());
        if (appdevs[key].data.labels.length > data_limit) {
            appdevs[key].data.labels.shift();
        }
        appdevs[key].update();
    }
}

const SyncClick = () => {
    if (scswork) return;
    findDevice().then(() => {
        createChart().then(() => {
            runScsData(updateChart).then(() => {
                deleteChart();
                console.log('runScsData done');
            });
        });
    });
}

const StopClick = () => {
    if (!scswork) return;
    stopScsData().then(() => {
        console.log('stopScsData done');
    });
}
</script>

