
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
