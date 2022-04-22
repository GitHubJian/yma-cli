declare module '*.vue' {
    import Vue, {VueConstructor, PluginFunction} from 'vue';

    export interface TbComponent extends Vue {}

    interface TbComponentConstructor<V extends TbComponent = TbComponent>
        extends VueConstructor<V> {
        name: string;
        install: PluginFunction<Record<string, unknown>>;
    }

    const TbComponent: TbComponentConstructor<TbComponent>;

    export default TbComponent;
}
