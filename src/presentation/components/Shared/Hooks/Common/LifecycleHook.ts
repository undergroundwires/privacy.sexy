/*
  These types are used to abstract Vue Lifecycle injection APIs
  (e.g., onBeforeMount, onUnmount) for better testability.
*/

export type LifecycleHook = (callback: LifecycleHookCallback) => void;

export type LifecycleHookCallback = () => void;
