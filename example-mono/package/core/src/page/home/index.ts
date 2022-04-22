import Vue from 'vue';
import VueCompositionApi from '@vue/composition-api';
import App from './App.vue';
import axios from 'axios';
console.log(axios);

import {plus} from 'common/src/export/util';

console.log(plus(1, 1));

Vue.use(VueCompositionApi);

new Vue({
    render: h => h(App),
}).$mount('#app');
