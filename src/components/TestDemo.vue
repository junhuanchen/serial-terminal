<template>
  <n-card>
    <n-button @click="handleClick1">
      启动
    </n-button>
    <n-button @click="handleClick2">
      停止
    </n-button>
    <n-button @click="handleClick3">
      测试 1
    </n-button>
    <n-button @click="handleClick4">
      测试 2
    </n-button>
  </n-card>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useMessage } from 'naive-ui'

import { runScsData, stopScsData, findDevice, setScsData, scswork, scsobjs } from '../utils/scs';

async function ScsStart() {
  if (scswork) {
    return;
  }
  findDevice().then(() => {
    console.log('findDevice done');
    runScsData(null).then(() => {
      console.log('runScsData done');
    });
  });
}

async function ScsStop() {
  if (!scswork) {
    return;
  }
  stopScsData().then(() => {
    console.log('stopScsData done');
  });
}

export default defineComponent({
  setup() {
    const message = useMessage()
    return {
      handleClick1() {
        ScsStart();
        message.info('Button ScsStart');
      },
      handleClick2() {
        ScsStop();
        message.info('Button ScsStop');
      },
      handleClick3() {
        setScsData("scsWritePosEx", 2, 5, 0, 0);
        message.info('Button scsWritePosEx 2, 5, 0, 0');
      },
      handleClick4() {
        setScsData("scsWritePosEx", 2, 4090, 0, 0);
        message.info('Button scsWritePosEx 2, 4090, 0, 0');
        
        // 延时一秒后执行
        for (let i in scsobjs) {
          setScsData("scsWritePosEx", i, 5, 0, 0);
        }
        setTimeout(() => {
          for (let i in scsobjs) {
            setScsData("scsWritePosEx", i, 4095, 0, 0);
          }
        }, 1000);
      }
    }
  }
})
</script>