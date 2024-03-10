
declare let Module: any;

const device_min = 1, device_max = device_min + 14;
const scsobjs = {}; // 局部，会产生作用域问题
let scswork = false;
let scsexit = false;
const scsdata = {}; // 全局 read 数据
const scscall = []; // 全局 write 数据

async function findDevice() {
    if (scswork) {
        return scswork;
    }
    scswork = true;
    Module.config(10, 20, 30);
    for (let i = device_min; i < device_max; i++) {
        scsobjs["dev_id_" + i] = await Module.scsPing(i);
        // console.log('findDevice', scsobjs);
    }
    return scswork;
}

const scsname = ["位置", "速度", "负载", "电压", "温度", "电流"];
async function getScsData(i) {

    try {
        while (scscall.length > 0) {
            const func = scscall[0][0];
            const args = scscall[0][1];
            const ret = await Module[func](...args);
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
    const data = [];
    data.push(await Module.scsReadPos(i));
    data.push(await Module.scsReadSpeed(i));
    data.push(await Module.scsReadLoad(i));
    data.push(await Module.scsReadVoltage(i));
    data.push(await Module.scsReadTemper(i));
    data.push(await Module.scsReadCurrent(i));
    return data;
}

// Module.setScsData("scsWritePosEx", 2, 2047, 0, 0);
const setScsData = Module.setScsData = (func, ...args) => {
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
        for (const key in scsobjs) {
            if (scsobjs[key] == -1) {
                continue;
            }
            const i = parseInt(key.split('_')[2]);
            await getScsData(i).then((data) => {
                // console.log(key, data);
                scsdata[key] = data;
            });
        }
        if(func_update) func_update();
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

export { findDevice, runScsData, stopScsData, scsobjs, scsdata, scsname, device_min, device_max, scswork, scsexit, scscall, getScsData, setScsData };