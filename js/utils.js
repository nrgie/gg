var indexedDB=window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
(function() {
    if (!indexedDB){console.error('indexDB not supported');return;}
    var db,keyValue={k:'',v:''},request=indexedDB.open('d2',1);
    request.onsuccess = function(e){db=this.result;};
    request.onerror = function(e){console.error('indexedDB request error');console.log(e);};
    request.onupgradeneeded = function(e){db=null;var store=e.target.result.createObjectStore('str',{keyPath:'k'});store.transaction.oncomplete = function (e){db=e.target.db;};};
    function getValue(k,cb){if(!db){setTimeout(function(){getValue(k,cb);},100);return;} db.transaction('str').objectStore('str').get(k).onsuccess=function(e){cb((e.target.result && e.target.result.v)||null);};}
    window['db']={get:getValue, set: function(key, value) { db.transaction('str', 'readwrite').objectStore('str').put({k:key,v:value});}};
    
})();


Storage.prototype.__walker = function(path,o) {
    //Validate if path is an object otherwise returns false
    if(typeof path !== "object") return undefined; if(path.length === 0) return o;for(var i in path){var prop=path[i];if(o.hasOwnProperty(prop)){var val=o[prop];if(typeof val=='object'){path.splice(0,1);return this.__walker(path,val);}else{return val;}}}
};

Storage.prototype.setObj = function(key, value) {
    var path=key.split('.'),_key=path[0],os=this.getItem(_key)!==null?JSON.parse(this.getItem(_key)):null; path.splice(0,1);
    if(os===null){os={};this.setItem(_key,JSON.stringify(os));}
    var innerWalker=function(path,o){if(typeof path !== "object") return undefined;if(path.length == 1) { o[path[0]] = value;return o;} else if(path.length === 0) {os = value;return os;}var val = null;
        for(var i in path){var prop = path[i];if(o.hasOwnProperty(prop)) {val = o[prop];if(typeof val == 'object'){path.splice(0,1);return innerWalker(path,val);}}else{o[prop] = {};val = o[prop];path.splice(0,1);return innerWalker(path,val);}}
    };
    innerWalker(path,os);
    this.setItem(_key,JSON.stringify(os));
};

Storage.prototype.getObj = function(key) {
    key = key.split('.');var _key = key[0];var o = this.getItem(_key) ? JSON.parse(this.getItem(_key)) : null;if(o === null) return undefined;key.splice(0,1);return this.__walker(key,o);
};

var util = {
	JSONfn : {
		stringify:function (obj) {
			return JSON.stringify(obj, function (key, value) {
				if (value instanceof Function || typeof value == 'function') return value.toString();
				if (value instanceof RegExp) return '_PxEgEr_' + value;
				return value;
			});
		}
	},
	_buildObj: function(obj, fn, args, context, importFiles){
		if(Array.isArray(context)) obj.imprt = context;
		else if(context) obj.cntx = context;
		if(importFiles) obj.imprt = importFiles;
	},
	workerpath: '/assets/js/worker.js',
	thread: (function() {
		return {
			exec: function(fn, args, cb, context, importFiles){
				var worker = new Worker(util.workerpath), obj = {fn:fn, args:args, cntx:false, imprt:false};
				util._buildObj(obj, fn, args, context, importFiles);
				worker.onmessage = function (oEvent) { cb(oEvent.data); worker.terminate(); };
				worker.onerror = function(error) { cb(null, error.message); worker.terminate(); };
				worker.postMessage(util.JSONfn.stringify(obj));
			},
			run: function(fn, args,  context, importFiles){
				var dfr = $.Deferred(), worker = new Worker(util.workerpath), obj = {fn:fn, args:args, cntx:false, imprt:false};   
				util._buildObj(obj, fn, args, context, importFiles);
				worker.onmessage = function (oEvent) { dfr.resolve(oEvent.data); worker.terminate(); };
				worker.onerror = function(error) { dfr.reject(new Error('Worker error: ' + error.message)); worker.terminate(); };
				worker.postMessage(util.JSONfn.stringify(obj));
				return dfr;
			},
			runAll: function(args) {
				var dfrs = [], len = args.length,ix; 
				for(ix=0; ix<len; ix++) dfrs.push(this.run.apply(this,args[ix]));
				return $.when.apply($,dfrs).then(function(){ return Array.prototype.slice.call(arguments);});
			}
		}
	}()),
	
	store: function(name) {
		this.name = name;
		
		return {
			isAvailable: function() {
				return ('localStorage' in window) && (window.location.protocol != 'file:');
			},
			exists: function(key) {
				return (this.get(key) != null);
			},
			set: function(key, value) {
				return window.localStorage.setItem(this._key(key), value);
			},
			get: function(key) {
				return window.localStorage.getItem(this._key(key));
			},
			clear: function(key) {
				window.localStorage.removeItem(this._key(key));;
			},
			_key: function(key) {
				return ['util', name].join('.') +"@"+ key;
			},
			getAll: function(key){
				var items=[];
				for(var i in window.localStorage){
					var item = window.localStorage[i];
					var re = new RegExp(key, 'ig');
					if(i.match(re)) {
						items[i] = window.localStorage[i];
					}
				}
				return items;
			}
		}
	},
	
    multiline: function(fn) {
		var reCommentContents = /\/\*!?(?:\@preserve)?[ \t]*(?:\r\n|\n)([\s\S]*?)(?:\r\n|\n)\s*\*\//;
		var match = reCommentContents.exec(fn.toString());
		return match[1];
    },
  
    unique: function() {
	  return id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
	      return v.toString(16);
	  });
    },
    
    linkify: function(text){
      if (text) {
        text = text.replace(
            /((https?\:\/\/)|(www\.))(\S+)(\w{2,4})(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/gi,
            function(url){
                var full_url = url;
                if (!full_url.match('^https?:\/\/')) {
                    full_url = 'http://' + full_url;
                }
                var t = full_url.replace(/.*?:\/\//g, "www.");
				debug("len:"+t.length);
				debug("iof:"+t.indexOf("/"));
				if(t.length-1 == t.indexOf("/")) t = t.replace("/", "");
				return '<a target="blank" href="' + full_url + '">' + t + '</a>';
            }
        );
      }
      return text;
    },

    render_cache: {},
    render_cache_plain: {},
    
    store_cache_enabled: true,
    jit_cache_enabled: true,
    
    render: function(template, data, callback) {
	  if (util.render_cache[template] && this.jit_cache_enabled) {
			callback(util.render_cache[template](data));
	  } else if(util.store("tmpl").get(template) && this.store_cache_enabled) {
			var tmpl = util.store("tmpl").get(template);
			var ts = parseInt(tmpl.substring(2, 12));
			if(ts > new Date()/1000 |0) 
				callback(new Function("obj", util.store("tmpl").get(template))(data));
			else
				$.get(template+"?v="+(Date.now() /1000 |0), function(tmpl) { if(tmpl.indexOf("DOCTYPE") == -1) callback(util.interpolate(template, tmpl, data)); });
	  } else {
		  $.get(template+"?v="+(Date.now() /1000 |0), function(tmpl) { if(tmpl.indexOf("DOCTYPE") == -1) callback(util.interpolate(template, tmpl, data)); });
	  }
    },

    interpolate: function(name, template, data, options) {
		var fn, escaped_string, expire=300;
		if (util.render_cache[name] && this.cache_enabled) { fn = util.render_cache[name]; } else { if (typeof template == 'undefined') return false; }
		if (options && options.escape_html === false) { escaped_string = "\",$1,\""; } else { escaped_string = "\",(function(a){return a;})($1),\""; }
		var _func_str = "var __=[];with(obj){__.push(\"" + String(template).replace(/[\r\t\n]/g, " ").replace(/\"/g, '\\"').split("<?").join("\t").replace(/((^|\?>)[^\t]*)/g, "$1\r").replace(/\t=(.*?)\?>/g, escaped_string).replace(/\t!(.*?)\?>/g, "\",$1,\"").split("\t").join("\");").split("?>").join("__.push(\"").split("\r").join("") + "\");}return __.join('');";
		fn = util.render_cache[name] = new Function("obj", _func_str);
		util.store("tmpl").set(name, "/*"+((new Date()/1000 |0)+expire)+"*/" + _func_str);
		util.render_cache_plain[name] = _func_str;
		//fn = util.render_cache[name] = new Function("obj", "var h=function(e){return e;},___$$$___=[],print=function(){___$$$___.push.apply(___$$$___,arguments);};" + "with(obj){___$$$___.push(\"" + String(template).replace(/[\r\t\n]/g, " ").replace(/\"/g, '\\"').split("<?").join("\t").replace(/((^|\?>)[^\t]*)/g, "$1\r").replace(/\t=(.*?)\?>/g, escaped_string).replace(/\t!(.*?)\?>/g, "\",$1,\"").split("\t").join("\");").split("?>").join("___$$$___.push(\"").split("\r").join("") + "\");}return ___$$$___.join('');");
		if (typeof data != 'undefined') { return fn(data); } else { return fn; }
    },
 
    obs: [],
    event : (function() {
	  return {
	      on: function(topic, observer) {
		  util.obs[topic] || (util.obs[topic] = []);
		  util.obs[topic].push(observer);
	      },
	      off: function(topic, observer) {
		  if (!util.obs[topic]) return;
		  var index = util.obs.indexOf(observer)
		  if (~index) { util.obs[topic].splice(index, 1) }
	      },
	      publish: function(topic, data) {
		  if (!util.obs[topic]) return;
		  for (var i = util.obs[topic].length - 1; i >= 0; i--) util.obs[topic][i](data)    
	      }
	  }
    }()),
 
	beats: [],
	beat : (function() {
		return {
			start: function(topic, observer, interval) {
				util.beats[topic] || (util.beats[topic] = '');
				util.beats[topic] = window.setInterval(observer, interval);
			},
			stop: function(topic) {
				if (!util.beats[topic]) return;
				window.clearInterval(util.beats[topic]);
			}
	  }
    }()),
 
	colors: {
		white: "#fff",
		black: "#000",
		primary: "#5677fc",
		info: "#03a9f4",
		success: "#259b24",
		warning: "#ffc107",
		danger: "#ff5722",
		// Material Colors
		red: "#f34235",
		pink: "#e81d62",
		purple: "#9b26af",
		deep_purple: "#6639b6",
		indigo: "#3e50b4",
		blue: "#2095f2",
		light_blue: "#02a8f3",
		cyan: "#00bbd3",
		teal: "#009587",
		green: "#4bae4f",
		light_green: "#8ac249",
		lime: "#ccdb38",
		yellow: "#feea3a",
		amber: "#fec006",
		orange: "#fe9700",
		deep_orange: "#fe5621",
		brown: "#785447",
		grey: "#9d9d9d",
		blue_grey: "#5f7c8a",

		// Flat colors
		turquoise: "#1abc9c",
		green_sea: "#16a085",
		emerald: "#2ecc71",
		nephritis: "#27ae60",
		peter_river: "#3498db",
		belize_hole: "#2980b9",
		amethyst: "#9b59b6",
		wisteria: "#8e44ad",
		wet_asphalt: "#34495e",
		midnight_blue: "#2c3e50",
		sunflower: "#f1c40f",
		orange: "#f39c12",
		carrot: "#e67e22",
		pumpkin: "#d35400",
		alizarin: "#e74c3c",
		pomegranate: "#c0392b",
		clouds: "#ecf0f1",
		silver: "#bdc3c7",
		concrete: "#95a5a6",
		asbestos: "#7f8c8d"
	},
	
	checkTouchScreen: function () {
		if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
			$('body').addClass('touch-screen');
			return true;
		} else {
			$('body').removeClass('touch-screen');
			return false;
		}
	},
		
	sound: (function() {
		return {
			play: function(){
				$("#sound")[0].play();
			},
			stop: function(){
				$("#sound")[0].stop();
			}
		}
	}()),

	noti: function(title, text, href) {
		var title = (!title) ? 'Ătlap':title, 
			text = (!text) ? '___text___':text, 
			icon = (!icon) ? '/android-chrome-192x192.png':icon, 
			href = (!href) ? '#':href;		
		if(notify.permissionLevel() == "granted") notify.createNotification(title,{body:text,icon:icon,onclick:href});
	}, 
	initNotify: function(){
		notify.requestPermission();
	}
}

function __(s) { return "="+s; }

function HashMap(other) {
    this.clear();
    switch (arguments.length) {
		case 0: break;
		case 1: this.copy(other); break;
		default: multi(this, arguments); break;
    }
    this.obs = [];
}

HashMap.prototype = {
	constructor:HashMap,

	on: function(topic, observer) {
	    this.obs[topic] || (this.obs[topic] = [])
	    this.obs[topic].push(observer)
	},
      
	off: function(topic, observer) {
	    if (!this.obs[topic]) return;
	    var index = this.obs.indexOf(observer)
	    if (~index) { this.obs[topic].splice(index, 1) }
	},
      
	trigger: function(topic, data) {
	    //debug(topic);
	    if (!this.obs[topic]) return;
	    for (var i = this.obs[topic].length - 1; i >= 0; i--) this.obs[topic][i](data)    
	},
	
	size: function(){
	    var size = 0, key;
	    for (key in this._data) { if (this._data.hasOwnProperty(key)) size++; }
	    return size;
	},
	
	get:function(key) {
		var data = this._data[this.hash(key)];
		return data && data[1];
	},

	set:function(key, value) {
		this._data[this.hash(key)] = [key, value];
	},

	multi:function() {
		this.multi(this, arguments);
	},

	copy:function(other) {
		for (var key in other._data) {
		    this._data[key] = other._data[key];
		}
	},

	has:function(key) {
		return this.hash(key) in this._data;
	},

	search:function(value) {
		for (var key in this._data) {
			if (this._data[key][1] === value) return this._data[key][0];
		}
		return null;
	},

	remove:function(key) {
		delete this._data[this.hash(key)];
	},

	type:function(key) {
		var str = Object.prototype.toString.call(key);
		var type = str.slice(8, -1).toLowerCase();
		if (type === 'domwindow' && !key) return key + ''; 
		return type;
	},

	keys:function() {
		var keys = [];
		this.forEach(function(value, key) { keys.push(key); });
		return keys;
	},

	values:function() {
		var values = [];
		this.forEach(function(value) { values.push(value); });
		return values;
	},

	count:function() {
		return this.keys().length;
	},

	clear:function() {
		this._data = {};
	},

	clone:function() {
		return new HashMap(this);
	},

	hash:function(key) {
		switch (this.type(key)) {
			case 'undefined':
			case 'null':
			case 'boolean':
			case 'number':
			case 'regexp':
				return key + '';
			case 'date':
				return 'âŁ' + key.getTime();
			case 'string':
				return 'â ' + key;
			case 'array':
				var hashes = [];
				for (var i = 0; i < key.length; i++) {
					hashes[i] = this.hash(key[i]);
				}
				return 'âĽ' + hashes.join('â');

			default:
				if (!key._hmuid_) {
					key._hmuid_ = ++HashMap.uid;
					this.hide(key, '_hmuid_');
				}
				return 'âŚ' + key._hmuid_;
		}
	},

	forEach:function(func, ctx, reverse) {
		var temp = [];
		
		for (var key in this._data) { temp.push(key); }
		
		if(reverse != undefined) { temp.reverse(); }
		
		for (var key in temp) {
		    var data = this._data[temp[key]];
		    func.call(ctx || this, data[1], data[0]);
		}
	},
	
	multi: function(map, args) {
	      for (var i = 0; i < args.length; i += 2) { map.set(args[i], args[i+1]); }
	},
	
	hide: function(obj, prop) {
	      if (Object.defineProperty) Object.defineProperty(obj, prop, {enumerable:false});
	},
	
	archive:function() {
	    var localData = {};
	    localData.keys = this.keys;
	    localData.data = this._data;
	    var json = unescape(encodeURIComponent(JSON.stringify(localData)));
	    return btoa(json);
	},
	
	restore:function(str) {
	    var localData = JSON.parse(decodeURIComponent(escape(atob(str))));
	    this.keys = localData.keys;
	    this._data = localData.data;
	},
};


