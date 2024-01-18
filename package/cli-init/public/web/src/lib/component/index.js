import Icon from './icon';

const components = [Icon];

const install = function (Vue) {
    components.forEach(function (component) {
        Vue.component(component.name, component);
    });
};

export default {
    install,
    Icon,
};
