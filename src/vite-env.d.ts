/// <reference types="vite/client" />

interface OneSignalDeferred {
  push(callback: (OneSignal: any) => void): void;
}

interface Window {
  OneSignalDeferred: OneSignalDeferred[] | undefined;
}