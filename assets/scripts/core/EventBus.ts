export type EventHandler = (payload?: any) => void;

class EventBus {
  private listeners: { [eventName: string]: EventHandler[] } = {};

  public on(eventName: string, handler: EventHandler): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(handler);
  }

  public off(eventName: string, handler: EventHandler): void {
    var handlers = this.listeners[eventName];
    if (!handlers) {
      return;
    }
    for (var i = handlers.length - 1; i >= 0; i--) {
      if (handlers[i] === handler) {
        handlers.splice(i, 1);
      }
    }
  }

  public emit(eventName: string, payload?: any): void {
    var handlers = this.listeners[eventName];
    if (!handlers) {
      return;
    }
    var copied = handlers.slice();
    for (var i = 0; i < copied.length; i++) {
      copied[i](payload);
    }
  }

  public clear(eventName?: string): void {
    if (eventName) {
      delete this.listeners[eventName];
      return;
    }
    this.listeners = {};
  }
}

export default new EventBus();
