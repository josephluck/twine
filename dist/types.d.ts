declare namespace Twine {
    type Reducer = (state, ...args: any[]) => any;
    interface Reducers {
        [key: string]: Reducer;
    }
    type Effect = (state, methods, ...args: any[]) => any;
    interface Effects {
        [key: string]: Effect;
    }
    interface Model {
        scoped?: boolean;
        state: any;
        reducers?: Reducers;
        effects?: Effects;
        models?: Models;
    }
    interface Models {
        [key: string]: Model;
    }
    type Subscription = (state, prev, methods: Methods) => any;
    interface ConfigurationOpts {
        onStateChange: Subscription;
        onMethodCall: any;
    }
    type Configuration = Subscription | ConfigurationOpts;
    interface Methods {
        [key: string]: Reducer | Effect | Methods;
    }
    type State = any;
    interface Output {
        state: any;
        methods: any;
    }
    type ReturnOutput = (model: Model) => Output;
}
export default Twine;
