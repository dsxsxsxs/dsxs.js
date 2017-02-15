
+function(){
    var taskQueue = [];
    window.addEventListener('message', function (ev) {
        var source = ev.source;
        if ((source === window || source === null) && ev.data === 'process-tick') {
            ev.stopPropagation();
            if (taskQueue.length > 0) {
                var fn = taskQueue.shift();
                fn();
            }
        }
    }, true);
    var nextTick=function (fn) {
        taskQueue.push(fn);
        window.postMessage('process-tick', '*');
    };
    window.nextTick=nextTick;
    var EventEmitter = function () {
        this.events = {};
    };

    EventEmitter.prototype.on = function (event, listener) {
        if (typeof this.events[event] !== 'object') {
            this.events[event] = [];
        }

        this.events[event].push(listener);
    };

    EventEmitter.prototype.off = function (event, listener) {
        var idx;

        if (typeof this.events[event] === 'object') {
            idx = this.events[event].indexOf(listener);

            if (idx > -1) {
                this.events[event].splice(idx, 1);
            }
        }
    };

    EventEmitter.prototype.emit = function (event) {
        var i, listeners, length, args = [].slice.call(arguments, 1);

        if (typeof this.events[event] === 'object') {
            listeners = this.events[event].slice();
            length = listeners.length;
            nextTick(function(){
                for (i = 0; i < length; i++) {
                    listeners[i].apply(this, args);
                }
            }.bind(this));
        }
    };

    EventEmitter.prototype.once = function (event, listener) {
        this.on(event, function g () {
            this.off(event, g);
            listener.apply(this, arguments);
        });
    };
    window.EventEmitter=EventEmitter;
}.call(this);
