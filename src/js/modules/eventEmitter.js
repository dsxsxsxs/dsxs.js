var EventEmitter = function () {
    this._events = {};
};

EventEmitter.prototype.on = function (ev, listener) {
    if (typeof this._events[ev] !== 'object')
        this._events[ev] = [];
        this._events[ev].push(listener);
};

EventEmitter.prototype.off = function (ev, listener) {
    if (typeof this._events[ev] === 'object') {
        var idx = this._events[ev].indexOf(listener);
        if (idx > -1)
            this._events[ev].splice(idx, 1);
    }
};

EventEmitter.prototype.emit = function (ev) {
    var i, listeners, length, args = Array.prototype.slice.call(arguments, 1);
    if (typeof this._events[ev] === 'object') {
        listeners = this._events[ev].slice();
        length = listeners.length;
        // nextTick(function(){
        for (i = 0; i < length; i++) {
            listeners[i].apply(this, args);
        }
        // }.bind(this));
    }
};

EventEmitter.prototype.once = function (ev, listener) {
    this.on(ev, function g () {
        this.off(ev, g);
        listener.apply(this, arguments);
    });
};
// window.EventEmitter=EventEmitter;
module.exports=EventEmitter;
