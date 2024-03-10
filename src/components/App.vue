<template>
    <n-loading-bar-provider>
        <n-message-provider>
            <n-notification-provider>
                <n-modal-provider>
                    <n-dialog-provider>
                        <dls-demo />
                        <test-demo />
                        <app-demo />
                    </n-dialog-provider>
                </n-modal-provider>
            </n-notification-provider>
        </n-message-provider>
    </n-loading-bar-provider>
</template>

<script>
import { defineComponent } from 'vue';
import AppDemo from './AppDemo.vue';
import DlsDemo from './DlsDemo.vue';
import TestDemo from './TestDemo.vue';

export default defineComponent({
    components: {
        AppDemo,
        DlsDemo,
        TestDemo,
    },
});
</script>