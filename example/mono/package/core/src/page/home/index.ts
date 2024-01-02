import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
import axios from 'axios';

import {plus} from 'common/src/export/util';
import App from './App.vue';

console.log(axios);

console.log(plus(1, 1));

Vue.use(VueCompositionApi);

new Vue({
    render: h => h(App),
}).$mount('#app');
