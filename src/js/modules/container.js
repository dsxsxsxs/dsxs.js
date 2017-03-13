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
