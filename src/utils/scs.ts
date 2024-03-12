
declare let Module: any;

const device_min = 1, device_max = device_min + 14;
let scsobjs = {}; // 局部，会产生作用域问题
let scswork = false;
let scsexit = false;
let scsdata = {}; // 全局 read 数据
let scscall = []; // 全局 write 数据

function initDevice() {
    scsobjs = {}; // 局部，会产生作用域问题
    scswork = false;
    scsexit = false;
    scsdata = {}; // 全局 read 数据
    scscall = []; // 全局 write 数据
}

async function findDevice() {
    initDevice();
    if (!Module['serial_wk']) {
        scswork = false;
        return false; // 串口没配置
    }
    if (scswork) {
        return scswork;
    }
    Module.config(20, 20, 30);
    for (let i = device_min; i < device_max; i++) {
        const tmp = await Module.scsPing(i);
        // console.log('findDevice', scsobjs);
        if (tmp != -1) {
            scsobjs[i] = tmp;
            scswork = true; // 串口设备不正确或确实没有设备
        }
    }
    console.log('findDevice', scsobjs);
    return scswork;
}

const scsflag = {"Pos":true, "Speed":true, "Load":true, "Current":true, "Voltage":false, "Temper":false, "Move":false};
async function getScsData(scsobjs) {
    try {
        while (scscall.length > 0) {
            const func = scscall[0][0];
            const args = scscall[0][1];
            await Module[func](...args);
            // const ret = await Module[func](...args);
            // console.log('setScsData', func, args, ret);
            scscall.shift();
        }
    } catch (e) {
        console.log('setScsData', e);
        while (scscall.length > 0) {
            scscall.shift();
        }
    }

    // for (const id in scsobjs) {
    //     // 调用 scsFeedBack 会获取此时所有数据，而 -1 解开此时数据，而不重新发起读取操作
    //     // 如果要采用同步读的方式，建议数据地址一致后采用，除非性能想要进一步提升。
    //     const data = {}
    //     await Module.scsFeedBack(parseInt(id));
    //     if (0 == await Module.scsGetErr()) {
    //         for (const key in scsflag) {
    //             if (scsflag[key]) {
    //                 data[key] = await Module["scsRead" + key](-1);
    //                 // await Module.scsReadPos(i);
    //                 // await Module.scsReadSpeed(i);
    //                 // await Module.scsReadLoad(i);
    //                 // await Module.scsReadCurrent(i);
    //             }
    //         }
    //         scsdata[id] = data;
    //     }
    // }
    
    // scsobjs > ["1", "2", "3", ]
    const ids = [];
    for (const id in scsobjs) ids.push(parseInt(id));
    await Module.scsSyncFeedBack(ids, ids.length).then((result) => {
        scsdata = result;
    });

    return scsdata;
}

// Module.setScsData("scsWritePosEx", 2, 2047, 0, 0);
const setScsData = Module.setScsData = (func, ...args) => {
    // console.log('callCmd', func, args);
    scscall.push([func, args]);
}

// Module.setSleep(500).then(() => Module.setScsData("scsWritePosEx", 2, 0, 0, 0));
const setSleep = Module.setSleep = (ms) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("setSleep done");
        }, ms);
    });
}

async function runScsData(func_update) {
    if (!scswork) {
        return;
    }

    scsexit = false;
    Module.config(10, 20, 30); // 约等于 14sum*8data*10ms=1120ms

    while (!scsexit) {
        await getScsData(scsobjs).then((result) => {
            // console.log('runScsData', result);
            if (func_update) func_update(result);
        });
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
    initDevice();
}

export { findDevice, runScsData, stopScsData, setScsData, setSleep, scsobjs, scsdata, scsflag, scscall, scswork, scsexit };