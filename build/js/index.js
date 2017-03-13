!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.dsxs=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
module.exports={
    util: _dereq_('./modules/util.js'),
    EventEmitter: _dereq_('./modules/EventEmitter'),
    Container: _dereq_('./modules/container')
};

},{"./modules/EventEmitter":2,"./modules/container":3,"./modules/util.js":4}],2:[function(_dereq_,module,exports){
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

},{}],3:[function(_dereq_,module,exports){
var _module={};
function VM(arg){
	var ctx= function(fn){
        return new Function('return function (arg){with(arg){('+fn+')()}};')();
    }
    return {
        run:function(fn){
            return ctx(fn)(arg);
        }
    }

}
function Container(){
}
Container.prototype.VM=VM;
Container.prototype.singleton=function(fname, proto,args){
    var proto={};
    ctx.call(proto);
    var cls=proto.constructor;
    proto.constructor=cls;
    cls.prototype=proto;
    if (args)
        args.unshift(null);
    _module[fname]= {instance:new (Function.prototype.bind.apply(cls, args))};
    return this;
};
Container.prototype.define=function(fname, ctx){
    var proto={};
    ctx.call(proto);
    var cls=proto.constructor;
    proto.constructor=cls;
    cls.prototype=proto;
    _module[fname]= {class:cls};
    return this;
}
Container.prototype.instantiate=function(fname, fn,args){
    var cls=_module[fname].class;
    args.unshift(null);
    if (cls)
        fn.call(this, new (Function.prototype.bind.apply(cls, args)))
    return this;
}
Container.prototype.factory=function(fname, fn){
    _module[fname]={instance:fn.call(this)};
    return this;
}
Container.prototype.inject=function(fname, fn){
    // Util.prototype.fname= new (Function.prototype.bind.apply(Something, [null, a, b, c]));
    if (fname instanceof Array)
        fn.apply(this, fname.map(function(_fname){
            return _module[_fname].class? _module[_fname].class:_module[_fname].instance;
        }));
    else fn.call(this, _module[fname].class? _module[fname].class:_module[fname].instance);
    return this;
}
Container.prototype.with=function(fname, fn){
    // Util.prototype.fname= new (Function.prototype.bind.apply(Something, [null, a, b, c]));
    if (!(fname instanceof Array))
        fname=[fname];
    var toWith={};
    fname.forEach(function(_fname){
        if (_module[_fname] && _module[_fname].class)
            this[_fname]=_module[_fname].class;
    },toWith);
    VM(toWith).run(fn);
    return this;
}
module.exports=Container;

},{}],4:[function(_dereq_,module,exports){

JSON.safeParse=function(s, cb){
    try {
        return this.parse(s);
    } catch (e) {
        if (cb)cb(e);
        return e;
    }
};
String.prototype.pad=function(width, z) {
    z = z || ' ';
    return this.length >= width ? this : new Array(width - this.length + 1).join(z) + this;
}
Number.prototype.pad=function(width, z) {
    z = z || '0';
    return (this+'').pad(width, z);
}
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
function bindAttribute(obj,key, attr, el) {
  Object.defineProperty(obj, key, {
    get: function() { return el.getAttribute(attr); },
    set: function(newattr) { return el.setAttribute(newattr); },
    // configurable: true,
    enumerable: true,
  });
}
function bindProperty(obj,key, attr, el) {
  Object.defineProperty(obj, key, {
    get: function() { return el[attr]; },
    set: function(newattr) { return el[attr]=newattr; },
    // configurable: true,
    enumerable: true,
  });
}
function bindNamedAttribute(obj,key, el) {
    var attr=key.replace(/([a-z]|(?:[A-Z0-9]+))([A-Z0-9]|$)/g, function(_, $1, $2) {
        return $1 + ($2 && '-') + $2;
    }).toLowerCase();
    bindAttribute(obj,key,attr, el);
}

function ValueModel(el) {
    this.name=el.name;
    this.el=el;
    Object.defineProperty(this, 'value', {
        get: function() { return el.value; },
        set: function(v) {
            el.value = v;
            this._apply();
        },
        // configurable: true,
        enumerable: true
    });
    this.handlers=[function(e){
        this.binded.forEach(function(el){
            if (el instanceof HTMLInputElement)el.value=this.value;
            else el.innerText=this.value;
        },this);
    }.bind(this)];
    this.binded=[];
    this.el.addEventListener('input',this.handlers[0]);
}
ValueModel.prototype._apply=function(handler){
    this.el.dispatchEvent(new Event('input'));
};
ValueModel.prototype.newListener=function(handler){
    this.handlers.push(handler);
    this.el.addEventListener('input',handler);
    this.apply();
};
ValueModel.prototype.delListener=function(handler){
    this.handlers.splice(this.handlers.indexOf(handler), 1);
    this.el.removeEventListener('input',handler);
};
ValueModel.prototype.bindTo=function(el){
    this.binded.push(el);
    this._apply();
};
ValueModel.prototype.unbind=function(el){
    this.binded.splice(this.binded.indexOf(el), 1);
};
function defineEnumProperty(obj,key,val) {
  Object.defineProperty(obj, key, {
    value: val,
    configurable: true,
    enumerable: true,
    writable: true
  });
}
var nativeEach=[].forEach;
var CustomDomElement=function(el){
    if (el instanceof CustomDomElement)return el;
    else if (el instanceof NodeList || el instanceof Array)
        ;
    else if (el instanceof HTMLElement)
        el=[el];
    else if (typeof el =='string'){
        el=new DOMParser().parseFromString(el, 'text/html').querySelector('body');
        if (el && el.firstChild)
            el=[].slice.call(el.childNodes);
    }
    this[0]=this.el=el;
    Object.defineProperty(this, 'raw', {
        get: function() { return this.el[0] || null; },
        set: function(v) {},
        enumerable: true,
    });
}

Object.defineProperty(CustomDomElement.prototype, 'val', {
    get: function()  { return this.raw.value || null; },
    set: function(v) { return this.raw.value=v },
    enumerable: true,
});
CustomDomElement.prototype.each=function(cb, thisArg){
    nativeEach.call(this.el, function(el){
        cb.call(thisArg || el, el);
    });
    return this;
}
CustomDomElement.prototype.on=function(){
    var args=arguments;
    this.each(function(el){
        el.addEventListener.apply(el, args);
    });
    return this;
}
CustomDomElement.prototype.off=function(){
    var args=arguments;
    this.each(function(el){
        el.removeEventListener.apply(el, args);
    });
    return this;
}
CustomDomElement.prototype.once=function(ev, handler, useCapture){
    this.each(function(el){
        el.addEventListener(ev,function g(){
            handler.apply(el,arguments);
            el.removeEventListener(ev, g);
        }, useCapture);
    });
}
CustomDomElement.delegate=function(ev,selector,handler){
    this.each(function(el){
        el.addEventListener(ev,function(e){
            nativeEach.call(this.querySelectorAll(selector), function(_el){
                e.currentDelegateTarget=_el;
                e.delegateTarget=this;
                handler.call(_el, e);
            },this)
        });
    });
}
CustomDomElement.prototype.emit=function(ev){
    var args=arguments;
    this.each(function(el){
        el.dispatchEvent(new Event(ev));
    });
    return this;
}
CustomDomElement.prototype.clone=function(){
    if (this.raw)
        return new CustomDomElement([this.raw.cloneNode(true)]);
}
CustomDomElement.prototype.remove=function(){
    if (this.raw.parentNode)
        this.raw.parentNode.removeChild(this.raw);
    return true;
}
CustomDomElement.prototype.append=function(appendee){
    if (appendee instanceof NodeList){
        appendee=new CustomDomElement(appendee);
    }else if (appendee instanceof HTMLElement){
        appendee=new CustomDomElement([appendee]);
    }else if (appendee instanceof CustomDomElement);
    this.each(function(el){
        appendee.each(function(ael){
            el.appendChild(ael);
        });
    });
    return this;
}
CustomDomElement.prototype.parent=function(){
    if (this.raw && this.raw.parentNode)
        return new CustomDomElement([this.raw.parentNode]);
    // return this;
}
CustomDomElement.prototype.closest=function(s){
    var matches = document.querySelectorAll(s),i,el = this.raw;
    do {
        i = matches.length;
        while (--i >= 0 && matches.item(i) !== el);
    } while ((i < 0) && (el = el.parentNode));
    return new CustomDomElement([el]);
}
CustomDomElement.prototype.addClass=function(cls){
    this.each(function(el){
        if (typeof cls =='string')
            el.classList.add(cls);
        else if (cls.forEach)
            cls.forEach(function(c){
                el.classList.add(c);
            });
    });
    return this;
}
CustomDomElement.prototype.removeClass=function(cls){
    this.each(function(el){
        if (typeof cls =='string')
            el.classList.remove(cls);
        else if (cls.forEach)
            cls.forEach(function(c){
                el.classList.remove(c);
            });
    });
    return this;
}
CustomDomElement.prototype.attr=function(arg1,arg2){
    if (typeof arg1 =='string' && !arg2)
        return this.raw.getAttribute(arg1);
    if (typeof arg1 =='string' && arg2!==undefined){
        var k =arg1;
        arg1={};
        arg1[k]=arg2;
    }
    for (var k in arg1)
        this.raw.setAttribute(k, arg1[k]);
    return this;
}
CustomDomElement.prototype.trigger=CustomDomElement.prototype.emit;

var Util=function(){

};

Util.prototype.inherit=function(Child, Parent){
    Child.prototype=Object.create(Parent.prototype);
    Child.prototype.constructor=Child;
}
Util.prototype.chain=function(Child, Parents){
    var rs=Object.create(Parents.shift().prototype);
    for (var i in Parents){
        var tmp=Object.create(Parents[i].prototype);
        tmp.__proto__.__proto__=rs.__proto__;
        rs=tmp;
    }
    Child.prototype = rs;
    Child.prototype.constructor=Child;
}
Util.prototype.select=function(selector, target){
    var el=null;
    if (target){
        if (typeof target =='string')
            el=document.querySelector(target).querySelectorAll(selector);
        else if(target instanceof CustomDomElement)
            el=target.raw.querySelectorAll(selector);
        else el=target.querySelectorAll(selector);
    }else
        el=document.querySelectorAll(selector);
    return new CustomDomElement(el);
}

Util.prototype.paramList=function (fn) {
    var ARROW_ARG = /\(([^(^)]+?)\)[\s]*?=>/m;
    var FN_ARGS = /^[^(]*\(\s*([^)]*)\)/m;
    var FN_ARG_SPLIT = /,/;
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var fnText = Function.prototype.toString.call(fn).replace(STRIP_COMMENTS, ''),
        params = fnText.match(ARROW_ARG) || fnText.match(FN_ARGS);
    return params[1].replace(/\s/g, '').split(FN_ARG_SPLIT);
}
Util.prototype.parseHTML=function(html){
    return new CustomDomElement(html);
}

Util.prototype.nextTick=nextTick;
Util.prototype.CustomDomElement=CustomDomElement;
Util.prototype.wrap=Util.prototype.parseHTML;
Util.prototype.ValueModel=ValueModel;

Util.prototype.defineEnumProperty=defineEnumProperty;
Util.prototype.bindAttribute=bindAttribute;
Util.prototype.bindProperty=bindProperty;
Util.prototype.bindNamedAttribute=bindNamedAttribute;
Util.prototype.log=console.log;

module.exports=Util;

},{}]},{},[1])
(1)
});