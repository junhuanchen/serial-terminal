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
                        <div v-for="(value, key) in appobjs" :key="key" style="width: 24%;">
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
import { runScsData, stopScsData, findDevice, scsobjs, scsflag, scswork } from '../utils/scs';

let appobjs = reactive({});
let appdevs = {};
let appflag = [];

function initChart() {
    appflag = [];
    appdevs = {};
}

async function createChart() {
    initChart();

    // 遍历 scsobjs 不为 -1 的设备 ID ，并在前添加 "dev_id_" 前缀做 canvas ID 
    for (let key in scsobjs) {
        if (scsobjs[key] != -1) {
            appobjs["dev_id_" + key] = scsobjs[key];
        }
    }

    // document.getElementById(key) maybe be null just wait so stupid
    await new Promise((resolve) => {
        setTimeout(() => {
            resolve("wait document.getElementById(key) ");
        }, 1000);
    });

    for (let key in appobjs) {
        if (appobjs[key] != -1) {

            const ctx = document.getElementById(key);

            const config = {
                type: 'scatter',
                data: {
                    datasets: []
                },
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
                            // beginAtZero: true,
                            // grace: 4095,
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

    for (let i in scsflag) if (scsflag[i]) appflag.push(i);

    console.log('appflag', appflag);
    console.log('appobjs', appobjs);
    console.log('appdevs', appdevs);
}

async function deleteChart() {
    for (let key in appdevs) {
        if (appdevs[key] != -1) {
            appdevs[key].destroy();
            appdevs[key] = -1;
        }
    }
    initChart();
}

async function updateChart(result) {

    // console.log(result);
    // console.log(new Date().getTime()); // 240ms 6*8 5ms

    const data_limit = 32;

    for (let id in result) {
        const key = "dev_id_" + id;
        let obj = appdevs[key].data.datasets;
        for (let pos = 0; pos < appflag.length; pos++) {
            if (!obj[pos]) {
                obj.push({
                    type: 'line',
                    // lineTension: 0.4,
                    label: appflag[pos],
                    data: [],
                });
            }

            if (obj[pos]) {
                obj[pos].data.push(result[id][appflag[pos]]);
                if (obj[pos].data.length > data_limit) {
                    obj[pos].data.shift();
                }
            }
            // console.log(pos, obj[pos].data);
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
