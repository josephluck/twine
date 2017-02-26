export declare namespace Twine {
    type Reducer = (state, ...args: any[]) => any;
    interface Reducers {
        [key: string]: Reducer;
    }
    type Effect = (state, actions, ...args: any[]) => any;
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
    type Subscription = (state, prev, actions: Actions) => any;
    interface ConfigurationOpts {
        onStateChange: Subscription;
        onMethodCall: any;
    }
    type Configuration = Subscription | ConfigurationOpts;
    interface Actions {
        [key: string]: Reducer | Effect | Actions;
    }
    type State = any;
    interface Output {
        state: any;
        actions: any;
    }
    type ReturnOutput = (model: Model) => Output;
}
