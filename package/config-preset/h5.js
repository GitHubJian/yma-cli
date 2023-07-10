import normal from './normal';
import {merge} from './util';

export default merge(normal, {
    plugins: ['yma-config-plugin-flexible'],
});
