const PluginAPI = require('../dist').default;

const api = new PluginAPI(__dirname, 'production');

api.toConfig().then(res => {
    console.log(res);
});
