import {captureException} from '../index'
import {formatComponentName, generateComponentTrace} from './util';

export interface Vue {
    config: {
        errorHandler?: any;
        warnHandler?: any;
        silent?: boolean;
    };
}

export interface ViewModel {
    _isVue?: boolean;
    __isVue?: boolean;
    $root: ViewModel;
    $parent?: ViewModel;
    $props: {[key: string]: any};
    $options?: {
        name?: string;
        propsData?: {[key: string]: any};
        _componentTag?: string;
        __file?: string;
    };
}

export const Plugin = (Vue: Vue, options): void => {
    const {errorHandler, warnHandler, silent} = Vue.config;

    Vue.config.errorHandler = (
        error: Error,
        vm: ViewModel,
        lifecycleHook: string
    ) => {
        const componentName = formatComponentName(vm, false);
        const trace = vm ? generateComponentTrace(vm) : '';
        const metadata: Record<string, unknown> = {
            componentName,
            lifecycleHook,
            trace,
        };

        if (options.attachProps && vm) {
            if (vm.$options && vm.$options.propsData) {
                metadata.propsData = vm.$options.propsData;
            } else if (vm.$props) {
                metadata.propsData = vm.$props;
            }
        }

        captureException()

        if (typeof errorHandler === 'function') {
            errorHandler.call(Vue, error, vm, lifecycleHook);
        }

        if (options.logErrors) {
            const hasConsole = typeof console !== 'undefined';
            const message = `Error in ${lifecycleHook}: "${
                error && error.toString()
            }"`;

            if (warnHandler) {
                warnHandler.call(null, message, vm, trace);
            } else if (hasConsole && !silent) {
                console.error(`[Vue warn]: ${message}${trace}`);
            }
        }
    };
};
