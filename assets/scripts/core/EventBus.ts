export type EventHandler = (payload?: any) => void;

interface EventListener {
  handler: EventHandler;
  target?: any;
}

class EventBus {
  private listeners: { [eventName: string]: EventListener[] } = {};

  public on(eventName: string, handler: EventHandler, target?: any): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push({
      handler: handler,
      target: target
    });
  }

  public off(eventName: string, handler: EventHandler, target?: any): void {
    var handlers = this.listeners[eventName];
    if (!handlers) {
      return;
    }
    for (var i = handlers.length - 1; i >= 0; i--) {
      var item = handlers[i];
      var sameHandler = item.handler === handler;
      var sameTarget = target === undefined || item.target === target;
      if (sameHandler && sameTarget) {
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
      var item = copied[i];
      if (item.target) {
        item.handler.call(item.target, payload);
      } else {
        item.handler(payload);
      }
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
