let has = Object.prototype.hasOwnProperty;
let prefix = '~';

function Events() {}

if (Object.create) {
    Events.prototype = Object.create(null);

    if (!new Events().__proto__) {
        prefix = false;
    }
}

function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
}

function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== 'function') {
        throw new TypeError('This listener must be a function');
    }

    let listener = new EE(fn, context || emitter, once);
    let evt = prefix ? prefix + event : event;

    if (!emitter._events[evt]) {
        emitter._events[evt] = [listener];
        emitter._eventsCount++;
    } else {
        emitter._events[evt].push(listener);
    }

    return emitter;
}

function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0) {
        emitter._events = new Events();
    } else {
        delete emitter._events[evt];
    }
}

function EventEmitter() {
    this._events = new Events();
    this._eventsCount = 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
    let names = [];
    let events;
    let name;

    if (this._eventsCount === 0) {
        return names;
    }

    for (name in (events = this._events)) {
        if (has.call(events, name)) {
            names.push(prefix ? name.slice(1) : name);
        }
    }

    return names;
};

EventEmitter.prototype.listeners = function listeners(event) {
    let evt = prefix ? prefix + event : event;
    let handlers = this._events[evt];

    if (!handlers) {
        return [];
    }

    for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
        ee[i] = handlers[i].fn;
    }

    return ee;
};

EventEmitter.prototype.listenerCount = function listenerCount(event) {
    let evt = prefix ? prefix + event : event;
    let handlers = this._events[evt];

    if (!handlers) {
        return 0;
    }

    return handlers.length;
};

EventEmitter.prototype.emit = function emit(event, a1, a2) {
    let evt = prefix ? prefix + event : event;
    if (!this._events[evt]) {
        return false;
    }

    let handlers = this._events[evt];
    let len = arguments.length;
    let args;
    let i;

    let length = handlers.length;
    let j;

    for (i = 0; i < length; i++) {
        if (handlers[i].once) {
            this.removeListener();
        }

        switch (len) {
            case 1:
                handlers[i].fn.call(handlers[i].context);
                break;
            case 2:
                handlers[i].fn.call(handlers[i].context, a1);
                break;
            case 3:
                handlers[i].fn.call(handlers[i].context, a1, a2);
                break;
            default:
                if (!args) {
                    for (j = 1, args = new Array(len - 1); j < len; j++) {
                        args[j - 1] = arguments[j];
                    }
                }

                handlers[i].fn.apply(handlers[i].context, args);
        }
    }

    return true;
};

EventEmitter.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
};

EventEmitter.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true);
};

EventEmitter.prototype.removeListener = function removeListener(
    event,
    fn,
    context,
    once
) {
    let evt = prefix ? prefix + event : event;

    if (!this._events[evt]) {
        return this;
    }

    if (!fn) {
        clearEvent(this, evt);
        return this;
    }

    let handlers = this._events[evt];

    for (var i = 0, events = [], length = handlers.length; i < length; i++) {
        if (
            handlers[i].fn !== fn ||
            (once && !handlers[i].once) ||
            (context && handlers[i].context !== context)
        ) {
            events.push(handlers[i]);
        }
    }

    if (events.length) {
        this._events[evt] = events.length === 1 ? events[0] : events;
    } else {
        clearEvent(this, evt);
    }

    return this;
};

EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    let evt;

    if (event) {
        evt = prefix ? prefix + event : event;
        if (this._events[evt]) {
            clearEvent(this, evt);
        }
    } else {
        this._events = new Events();
        this._eventsCount = 0;
    }

    return this;
};

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.addListener = EventEmitter.prototype.on;

EventEmitter.prefixed = prefix;

export default EventEmitter;
