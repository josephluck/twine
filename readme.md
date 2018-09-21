# Functional front-end UI state management

Twine is a functional state management library akin to redux. Using Typescript, it is feasible to achive 100% type safety in both state, state change functions and asynchronous side effect management and control flow functions including pages. Twine provides a tree structure using models and it is possible to nest models within models. Twine is heavily inspired by the Elm architecture.

## For:
- People who don't like flux standard actions with magic 'dispatch' methods
- People who use typescript and want their state management fully typed thoughout their app

## Examples:
The easiest way to see the API is by looking at [the tests](test)!

## Todo:
Consider using type inference for return values for effects a'la: 

```
export interface ThunkDispatch<S, E, A extends Action> {
  <T extends A>(action: T): T;
  <R>(asyncAction: ThunkAction<R, S, E, A>): R;
}
```
