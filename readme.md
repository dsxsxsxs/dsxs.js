dsxs.js Docs
===================

Native Class Methods
----------
### JSON.safeParse()
#### Syntax
```javascript
JSON.safeParse(text [,errorCallback]);
```
#### Example
```javascript
var obj = JSON.safeParse({test: ,,,}, function(err){
	//error throwed do something.
});
//obj is null
var obj2 = JSON.safeParse({});
//obj2=={}
```
### String.prototype.pad()
#### Syntax
```javascript
str.pad(width [,paddingCandidate]);
```
#### Example
```javascript
"abc".pad(3, 0);
//return "abc"
"abc".pad(4, 0);
//return "0abc"
"abc".pad(5);
//return "  abc"
"abc".pad(4, "x");
//return "xabc"
```
### Number.prototype.pad()
#### Syntax
```javascript
num.pad(width, paddingCandidate);
```
#### Example
```javascript
var num=10;
num.pad(3, 0);
//return "010"
(22).pad(3, "0x");
//return "0x22"
```

## Application Container
```javascript
var app =new Container;
```
### Container.prototype.define()
This method defines a class and stores into the container.
#### Syntax
```javascript
.define(name, initializer)
```
#### Example
```javascript
app.define("ThisIsA", function(){
	this.constructor=function ThisIsA(){
		var a=1;
    };
	this.getA=function(){
		return this.a;
	};
	this.dosomething=function(){
	};
});
```
### Container.prototype.instantiate()
This method instantiate a class from container and inject it to the handler.
#### Syntax
```javascript
.define(name, function, argumentList)
```
#### Example
```javascript
app.define("ThisIsA", function(){
	this.constructor=function ThisIsA(opt){
		var a=opt;
    };
	this.getA=function(){
		return this.a;
	};
	this.dosomething=function(){
	};
});
app.instantiate("ThisIsA", function(instanceA){
	instanceA.getA(); // return 123
}, [123])
app.instantiate("ThisIsA", function(instanceA){
	instanceA.getA(); // return 456
}, [456])

```

### Container.prototype.singleton()
This method immediately define-and-instantiate a class and store the instance into the container.
#### Syntax
```javascript
.singleton(name, initializer, argumentList)
```
#### Example
```javascript
app.singleton("instanceB", function(){
	this.constructor=function ThisIsB(opt){
		var b=opt;
    };
	this.getB=function(){
		return this.b || null;
	};
	this.dosomething=function(){
	};
},[456]);
app.inject("ThisIsB",function(instanceB){
	instanceB.getB(); //return 456
});

```
### Container.prototype.factory()
This method assigns whatever the factory function has returned.
#### Syntax
```javascript
.factory(name, function)
```
#### Example
```javascript
app.factory("ThisIsC", function(){
	return {
		c: 2,
		dosomething: function(){
		};
	};
});
```
### Container.prototype.inject()
The method peforms DI of the container, dependencies are injected into the arguments list of the given function.
#### Syntax
```javascript
.inject(target|targetList, function)
```
#### Example
```javascript
app.inject("instanceB", function(instanceB){
	// dosomething
});
app.inject(["ThisIsA","instanceB", "ThisIsC"], function(ThisIsA, instanceB, ThisIsC){
	// dosomething
    var a = new ThisIsA; // ThisIsA is a class
    a.getA();
    instanceB.getB(); // instanceB is a class of ThisIsB
    ThisIsC.c; // ThisIsC is a object given by return value of factory function.
});
```
### Container.prototype.with()
A convinient way for performing DI, dependencies will exists in the function scope directly, no need to give symbols for parameter list.
#### Syntax
```javascript
.with(target|targetList, function)
```
#### Example
```javascript
app.with("instanceB", function(){
	// dosomething
    instanceB.getB();
});
app.with(["ThisIsA","instanceB", "ThisIsC"], function(){
	// dosomething
    var a = new ThisIsA; // ThisIsA is a class
    a.getA();
    instanceB.getB(); // instanceB is a class of ThisIsB
    ThisIsC.c; // ThisIsC is a object given by return value of factory function.
});
```

## Prototypical Inheritance Helpers
### util.inherit()
#### Syntax
```javascript
util.inherit(Child, Parent);
```
#### Example
```javascript
function Parent(){
}
Parent.prototype.myNameIs=function(){
	return this.name || "";
}
function Child(){
	this.name="taro"
}
util.inherit(Child, Parent);
new Child().myNameIs();
//return "taro"
```
### util.chain()
#### Syntax
```javascript
util.chain(Child, [Parents]);
```
#### Example
```javascript
function Parent1(){
}
Parent1.prototype.myNameIs=function(){
	return this.name || "";
}
function Parent2(){
}
Parent2.prototype.amIGreat=function(){
	return true;
}
function Child(){
	this.name="taro"
}
util.chain(Child, [Parent1, Parent2]);
var child=new Child;
child.myNameIs();
//return "taro"
child.amIGreat();
//return true
```

## DOM Manipulation Helpers

### util.select()
#### Syntax
```javascript
util.select(selector [,selector|element]);
```
#### Example
```javascript
var wrappedEl1 = util.select('div.container');
var wrappedEl2 = util.select('div.container', 'body');
var wrappedEl3 = util.select('div.container', el);
// wrappedEl is an object that contains elements and inherited util methods.
```
### util.wrap()

#### Syntax
```javascript
util.wrap(element|HTMLtext);
```
#### Example
```javascript
var body=document.querySelector('body');
var wrappedBody=util.wrap(body);
var parsed = util.wrap('<div><input /></div>');
```
## Wrapped Elements properties/Methods
### .raw
The alias of the first selected DOM element.
### .el
The list of selected elements. It could be an NodeList or Array.
### .val
The alias of the value attribute of the  first selected DOM element, it returns null of value attributed doesn't exist.
### .on()
wrapped method of native **.addEventListener()**
#### Syntax
```javascript
.on(event, handler [,useCapture]);
```
#### Example
```javascript
util.select('button').on('click', function(e){
	// do something
});
```
### .once()

#### Syntax
```javascript
.once(event, handler [,useCapture]);
```
#### Example
```javascript
util.select('button').once('click', function(e){
	// handler will be invoked only once.
});
```
### .delegate()

#### Syntax
```javascript
.delegate(event, selector, handler);
```
#### Example
```javascript
util.select('div.button-list').delegate('click', 'button', function(e){
	console.log(e.delegateTarget); // div.button-list
    console.log(e.currentDelegateTarget); // current clicked button in div.button-list
});
```
### .off()
wrapped method of native **.removeEventListener()**
#### Syntax
```javascript
.off(event, handler [,useCapture]);
```
#### Example
```javascript
function handleClick(e){
}
util.select('button').on('click', handleClick);
// when need to off
util.select('button').off('click', handleClick);
```
### .emit()
The method generates an event object and invokes native **.dispatchEvent()**
#### Syntax
```javascript
.emit(event);
```
#### Example
```javascript
util.select('button').emit('click');
```
### .trigger()
An alias of **.emit()**.
### .each()

#### Syntax
```javascript
.each(callBack [,thisArg]);
```
#### Example
```javascript
var obj={};
util.select('button').each(function(button){
	//this is obj
}, obj);
util.select('button').each(function(button){
	//this is button
});
```
### .clone()
The method does deep cloning by  taking **.raw** and calls native **.cloneNode(true)**
#### Syntax
```javascript
.clone();
```
#### Example
```javascript
var toClone=util.select('#an-element');
var cloned = toClone.clone();
toClone==cloned;
//return false
```
### .remove()
The method removes **.raw** from dom tree, returning  true if  native  **.removeChild()** were completed.
#### Syntax
```javascript
.remove();
```
#### Example
```javascript
util.select('#an-element').remove();
```
### .append()
The method iterates  **.el** and calls native **appendChild()**.

#### Syntax
```javascript
.append(NodeList|element|wrappedElement);
```
#### Example
```javascript
util.select('.some-elements').append(util.wrap('<input />'));
```
### .parent()
The method returns the parantNode of **.raw**.
#### Syntax
```javascript
.parent();
```
#### Example
```javascript
util.select('#an-element').parent().append(util.wrap('<input />'));
```
### .closest()
The method returns the first ancestor of **.raw** which matches the given selector. It returns **null** if no any match found.
#### Syntax
```javascript
.closest(selector);
```
#### Example
```javascript
util.select('#an-element').closest('div.list');
```
### .addClass()
The method repeatedly invokes **.classList.add()** of each element in **.el**.
#### Syntax
```javascript
.addClass(string|[string]);
```
#### Example
```javascript
util.select('.some-elements').addClass(['indent-4', 'bright', 'easing']);
```
### .removeClass()
The method repeatedly invokes **.classList.remove()** of each element in **.el**.
#### Syntax
```javascript
.removeClass(string|ArrayOfStrings);
```
#### Example
```javascript
util.select('.some-elements').removeClass('easing');
```
### .attr()
The method does either get the value of given attribute or set the value given attribute in **.raw**.
#### Syntax
```javascript
.attr(string|object[,value]);
```
#### Example
```javascript
util.select('#an-element').attr('id');
//return "an-element"
util.select('#an-element').attr('name', 'John').attr({
	"value": 123,
	"alt": "some text"
});
```
## Other Methods

### util.paramList()
Retrieves the parameter list of the given function.
#### Syntax
```javascript
util.paramList(function);
```
#### Example
```javascript
util.paramList((arrow, func)=>{
});
//return ["arrow", "func"]
util.paramList(function(abc, def){
});
//return ["abc", "def"]

```

## Data binding

### Class: ValueModel
The class only works with input within type of text, email, number. It only listens the **input** event currently.
An input element must be passed into the constructor.
```javascript
var model = new util.ValueModel(el);
```
#### Properties
The model will emit **input** event automatically while the **value** had been assigned.
>ValueModel.el
>ValueModel.name
>ValueModel.value

#### ValueModel.prototype.addListener()
#### Syntax
```javascript
model.addListener(handler);
```
#### ValueModel.prototype.delListener()
#### Syntax
```javascript
model.delListener(handler);
```
#### ValueModel.prototype.bindTo()

#### Syntax
```javascript
model.bindTo(htmlElement);
```
#### ValueModel.prototype.unbind()
#### Syntax
```javascript
model.unbind(htmlElement);
```
### Example
```html
<ul>
    <li class="item">
      <input type="text" name="somemodel" value="">
    </li>
    <li class="item">
      <input type="text" id="bind-value" name="" value="">
    </li>
    <li id="bind-text" class="item"></li>
</ul>
```
```javascript
var model=new util.ValueModel(util.select('input[name="somemodel"]').raw);
model.bindTo(util.select('#bind-value').raw);
model.bindTo(util.select('#bind-text').raw);
model.value="sometext";
```
