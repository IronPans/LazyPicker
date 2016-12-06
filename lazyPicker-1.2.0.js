/**
 
 @Name : lazyPicker v1.2.0 移动日期控件
 @Author: TG
 @Date: 2016-12-05
 @Site：https://github.com/IronPans/LazyPicker/blob/master/lazyPicker-1.2.0.js
 
 */
(function() {
	'use strict';
	var LazyPicker = function(container, params) {
		if(!(this instanceof LazyPicker)) return new LazyPicker(params);
		var p = this;
		var currentslide = null;
		var moveY = [];
		var activeMoveY = 0;
		var startY = 0;
		var index = 0;
		var years = [];
		var months = [];
		var days = [];
		var defaults = {
			type: '1',
			theme: 'green',
			itemHeight: 40,
			minDate: 1950
		};
		p.defaultMove = [];
		params = params || {};
		var originalParams = {};
		for(var param in params) {
			if(typeof params[param] === 'object' && params[param] !== null) {
				originalParams[param] = {};
				for(var deepParam in params[param]) {
					originalParams[param][deepParam] = params[param][deepParam];
				}
			} else {
				originalParams[param] = params[param];
			};
		};
		for(var def in defaults) {
			if(typeof params[def] === 'undefined') {
				params[def] = defaults[def];
			} else if(typeof params[def] === 'object') {
				for(var deepDef in defaults[def]) {
					if(typeof params[def][deepDef] === 'undefined') {
						params[def][deepDef] = defaults[def][deepDef];
					}
				}
			}
		};
		p.picker = typeof container === 'string' ? document.querySelectorAll(container) : container;
		if(p.picker.length == 0) return;
		if(p.picker.length > 1) {
			var pickers = [];
			for(var i = 0; i < p.picker.length; i++) {
				pickers.push(new LazyPicker(p.picker[i], params));
			};
			return pickers;
		};
		p.picker = p.picker.length ? p.picker[0] : p.picker;
		p.picker.readOnly = true;
		p.params = params;
		p.originalParams = originalParams;
		p.currentDateInput = null;
		p.initValue = [];
		p.defaultValue = [];
		p.selectValue = [];
		p.currentSelected = [];
		p.defaultSelected = [];
		if(!p.params.data) {
			(function setInitDate(p) {
				var curDate = new Date();
				p.initValue = [curDate.getFullYear(), curDate.getMonth() + 1, curDate.getDate()];
				if(typeof p.params.initValue === 'string') {
					p.initValue = p.params.initValue.split(/\/|-/gm);
				};
				var arr = p.initValue.map(function(v) {
					return format(v);
				});
				p.initValue = arr;
				p.initValue[p.initValue.length] = 0;
				p.params.maxDate = p.params.maxDate ? p.params.maxDate : parseInt(p.initValue[0]) + 20;
				p.initValue[0] = parseInt(p.initValue[0]) > p.params.maxDate ?
					p.params.maxDate : p.initValue[0];
				p.params.initValue = p.initValue[p.initValue.length - 1] = p.initValue[0] + '-' +
					p.initValue[1] + '-' + p.initValue[2];
			})(p);
		};

		function format(d) {
			d = parseInt(d) >= 10 ? d : '0' + parseInt(d);
			return d;
		};
		p.getCountDays = function(d) {
			var curDate = new Date();
			var curMonth = curDate.getMonth();
			curDate.setMonth(curMonth + 1);
			if(typeof d !== 'undefined') {
				curDate = new Date(d);
				curMonth = curDate.getMonth();
				curDate.setMonth(curMonth);
			};
			curDate.setDate(32);
			return 32 - curDate.getDate();
		};
		p.openModalOverlap = function() {
			p.overlap = document.createElement('div');
			p.overlap.className = 'picker-modal-overlap';
			p.overlap.style.width = window.innerWidth + 'px';
			p.overlap.style.height = window.innerHeight + 'px';
			document.body.appendChild(p.overlap);
			p.overlap.addEventListener('click', p.closeModal);
			setTimeout(function() {
				document.body.classList.add('modal-open');
			}, 100);
		};
		p.closeModal = function() {
			document.body.classList.remove('modal-open');
			setTimeout(function() {
				document.body.removeChild(p.overlap);
				p.container && document.body.removeChild(p.container);
				for(var i = 0; i < moveY.length; i++) {
					moveY[i] = p.defaultMove[i];
					p.initValue[i] = p.defaultValue[i];
					p.params.data ? p.currentSelected[i] = p.defaultSelected[i] : '';
				};
			}, 260);
		};
		p.drawDate = function() {
			var yearList = "";
			for(var i = p.params.minDate; i < p.params.maxDate + 1; i++) {
				years.push(i);
				yearList += '<div class="item" data-val="' + i + '">' + i + '</div>';
			};
			var monthList = "";
			for(var i = 1; i < 13; i++) {
				months.push(i);
				monthList += '<div class="item" data-val="' + i + '">' + format(i) + '</div>';
			};
			var num = p.getCountDays();
			var dayList = "";
			for(var i = 1; i < num + 1; i++) {
				days.push(i);
				dayList += '<div class="item" data-val="' + i + '">' + format(i) + '</div>';
			};
			return {
				yearList: {
					"name": "年",
					"list": yearList
				},
				monthList: {
					"name": "月",
					"list": monthList
				},
				dayList: {
					"name": "日",
					"list": dayList
				}
			};
		};
		p.confirm = function() {
			if(p.params.clickInput) return;
			var selector = document.querySelector('.picker-selector').innerHTML;
			if(p.params.data) {
				p.initValue = [];
				var data = p.params.data.item;
				var child = data[p.currentSelected[0]];
				for(var i = 0; i < p.currentSelected.length; i++) {
					p.initValue[i] = child ? (child.name ? [child.name, child.id] : '') : '';
					child = child ? (child.child ? child.child[p.currentSelected[i + 1]] : '') : '';
				};
				selector = p.initValue;
				p.currentDateInput.value = selector.map(function(v) {
					return v[0];
				}).join('-');
				p.initValue[p.initValue.length] = p.currentDateInput.value;
			} else {
				p.currentDateInput.value = selector;
				p.initValue[p.initValue.length - 1] = p.currentDateInput.value;
			};
			for(var i = 0; i < moveY.length; i++) {
				p.defaultMove[i] = moveY[i];
				p.defaultValue[i] = p.initValue[i];
				p.params.data ? p.defaultSelected[i] = p.currentSelected[i] : '';
			};
			p.params.onChange && p.params.onChange.call(p, p.initValue);
			document.body.classList.remove('modal-open');
			setTimeout(function() {
				document.body.removeChild(p.overlap);
				p.container && document.body.removeChild(p.container);
			}, 260);
		};
		p.drawItem = function() {
			var num = p.getCountDays(p.initValue[0] + "/" + p.initValue[1] + "/1");
			var dayList = "";
			var p3 = document.querySelector('.p3');
			for(var i = 1; i < num + 1; i++) {
				days.push(i);
				dayList += '<div class="item" data-val="' + i + '" style="height:' +
					p.params.itemHeight + 'px;line-height:' +
					p.params.itemHeight + 'px">' + (i >= 10 ? i : ("0" + i)) + '</div>';
			};
			p3.innerHTML = dayList;
			var dist = (num - 2) * p.params.itemHeight;
			p.initValue[2] = Math.floor((Math.abs(moveY[2]) > dist ? num : p.initValue[2]));
			moveY[2] = Math.abs(moveY[2]) > dist ? -dist : moveY[2];
			setTransform(p3, "translate(0px," + moveY[2] + "px)");
		};
		p.drawPicker = function() {
			var list = [];
			var picker = null;
			var overlay = null;
			var itemIndex = 0;
			p.container = document.createElement("div");
			p.container.className = "picker-container";
			var btn = '<div class="picker-tool">';
			btn += '<div class="picker-button"><span class="picker-cancel">取消</span></div>';
			btn += '<div class="picker-button"><span class="picker-confirm">确认</span></div></div>';
			if(!p.params.data || typeof p.params.data === 'string') {
				list = p.drawDate();
				picker = '<div class="picker-selector">' + p.initValue[p.initValue.length - 1];
				picker += '</div><div class="picker-wrapper">';
				var s = 1;
				for(var v in list) {
					picker += '<div class="picker-slide"> <div class = "picker-title">' + list[v].name;
					picker += ' </div><div class="item-box">';
					picker += '<div class="item-list p' + s + '"> ' + list[v].list + '</div>';
					picker += '<div class="picker-overlay"></div>';
					p.params.type == 1 ? picker += '<div class="picker-line"></div>' : '';
					picker += '</div></div>';
					s++;
				};
				picker += '</div>';
				picker += btn;
				p.container.innerHTML = picker;
				p.params.type == 2 ? p.container.classList.add('picker-type2') : '';
				document.body.appendChild(p.container);
				p.container.classList.add('theme-' + p.params.theme);
				overlay = document.querySelectorAll(".picker-overlay");
				if(document.querySelector(".item-list .item")) {
					var items = document.querySelectorAll(".item-list .item");
					for(var i = 0; i < items.length; i++) {
						items[i].style.height = p.params.itemHeight + "px";
						items[i].style.lineHeight = p.params.itemHeight + "px";
					};
					for(var i = 0; i < overlay.length; i++) {
						overlay[i].addEventListener("touchstart", p.touchstart);
						overlay[i].setAttribute("data-index", i);
						overlay[i].parentNode.style.height = p.params.itemHeight * 3 + "px";
					};
					var years = p.params.minDate > parseInt(p.initValue[0]) ? 0 :
						(parseInt(p.initValue[0]) - p.params.minDate - 1);
					moveY[0] = -years * p.params.itemHeight;
					moveY[1] = -(parseInt(p.initValue[1]) - 2) * p.params.itemHeight;
					moveY[2] = -(parseInt(p.initValue[2]) - 2) * p.params.itemHeight;
					for(var i = 0; i < moveY.length; i++) {
						p.defaultMove[i] = moveY[i];
						p.defaultValue[i] = p.initValue[i];
					};
					setTransform(document.querySelector(".p1"), "translate(0px," + moveY[0] + "px)");
					setTransform(document.querySelector(".p2"), "translate(0px," + moveY[1] + "px)");
					setTransform(document.querySelector(".p3"), "translate(0px," + moveY[2] + "px)");
				};
			} else {
				var data = p.params.data;
				picker = '<div class="picker-selector"></div><div class="picker-wrapper">';
				if(p.currentSelected.length != 0) {
					for(var i = 0; i < p.currentSelected.length; i++) {
						moveY[i] = p.defaultSelected[i];
					}
				};
				picker += drawItem(data.item);
				picker += '</div>';
				picker += btn;
				p.container.innerHTML = picker;
				document.body.appendChild(p.container);
				p.params.type == 2 ? p.container.classList.add('picker-type2') : '';
				p.container.classList.add('theme-' + p.params.theme);
				p.slides = p.container.querySelectorAll('.picker-slide');
				var width = p.container.offsetWidth / p.slides.length;
				for(var i = 0; i < p.slides.length; i++) {
					p.slides[i].style.width = width + 'px';
					p.slides[i].setAttribute('data-index', i);
				};
				overlay = document.querySelectorAll(".picker-overlay");
				if(document.querySelector(".item-list .item")) {
					var items = document.querySelectorAll(".item-list .item");
					for(var i = 0; i < items.length; i++) {
						items[i].style.height = p.params.itemHeight + "px";
						items[i].style.lineHeight = p.params.itemHeight + "px";
					};
					var itemName = data.itemName ? data.itemName.split('-') : '';
					for(var i = 0; i < overlay.length; i++) {
						overlay[i].addEventListener("touchstart", p.touchstart);
						overlay[i].setAttribute("data-index", i);
						p.currentSelected[i] = moveY[i];
						p.defaultSelected[i] = moveY[i];
						itemName && (overlay[i].parentNode.previousElementSibling.innerHTML = itemName[i]);
						overlay[i].parentNode.style.height = p.params.itemHeight * 3 + "px";
						moveY[i] = (moveY[i] == 0) ? p.params.itemHeight : 
								(1 - moveY[i]) * p.params.itemHeight;
						setTransform(overlay[i].previousElementSibling, "translate(0px," + moveY[i] + "px)");
					};
				};
			};

			function drawItem(data) {
				var picker = '';
				if(p.currentSelected.length == 0) {
					moveY.push(0);
				};
				var itemList = '';
				for(var i = 0; i < data.length; i++) {
					itemList += '<div class="item" data-id="' + (data[i].id ? data[i].id : '');
					itemList += '" data-val="' + data[i].name + '">' + data[i].name + '</div>';
					(typeof data[i].selected !== 'undefined' && p.currentSelected.length == 0) ? 
						(moveY[itemIndex] = i) : '';
				};
				picker += '<div class="picker-slide"><div class = "picker-title"></div>';
				picker += '<div class="item-box"><div class="item-list"> ' + itemList + '</div>';
				picker += '<div class="picker-overlay"></div>';
				p.params.type == 1 ? picker += '<div class="picker-line"></div>' : '';
				picker += '</div></div>';
				var child = data[moveY[itemIndex]] ? data[moveY[itemIndex]].child : '';
				itemIndex++;
				if(child && Array.isArray(child) && child.length > 0) {
					picker += drawItem(child);
				}
				return picker;
			}
			var confirm = document.querySelector('.picker-confirm');
			confirm && addEvent(confirm, 'click', p.confirm, false);
			var cancel = document.querySelector('.picker-cancel');
			cancel && addEvent(cancel, 'click', p.closeModal, false);
			p.openPicker();
			p.openModalOverlap();
		};
		p.init = function() {
			addEvent(p.picker, 'click', function() {
				p.currentDateInput = this;
				p.drawPicker();
			}, false);
			document.body.addEventListener('touchmove', function(e) {
				if(document.body.classList.contains('modal-open')) {
					e.preventDefault();
				}
			});
		};
		p.openPicker = function(e) {
			setTimeout(function() {
				document.body.classList.add('modal-open');
			}, 100);
		};
		p.touchstart = function(e) {
			currentslide = this.previousElementSibling;
			if(currentslide.querySelectorAll('.item').length == 0) return;
			var e = e || window.event;
			var touch = e.touches[0];
			index = this.getAttribute("data-index");
			startY = touch.pageY;
			activeMoveY = moveY[index];
			document.addEventListener("touchmove", p.touchmove);
			document.addEventListener("touchend", p.touchend);
		};
		p.touchmove = function(e) {
			if(currentslide.querySelectorAll('.item').length == 0) return;
			var e = e || window.event;
			var touch = e.touches[0];
			var eY = touch.pageY;
			activeMoveY += eY - startY;
			startY = eY;
			setTransform(currentslide, "translate(0px," + activeMoveY + "px)");
		};
		p.touchend = function(e) {
			if(currentslide.querySelectorAll('.item').length == 0) return;
			var pHeight = currentslide.offsetHeight;
			if(activeMoveY >= p.params.itemHeight && activeMoveY > 0) {
				activeMoveY = p.params.itemHeight;
			} else if(activeMoveY < 0 && Math.abs(activeMoveY) > (pHeight - 2 * p.params.itemHeight)) {
				activeMoveY = (2 * p.params.itemHeight - pHeight);
			} else {
				var mY = Math.abs(activeMoveY);
				var itemHeight = p.params.itemHeight;
				var leave = mY % itemHeight;
				var produce = Math.floor(mY / itemHeight);
				leave != 0 ? activeMoveY = (-produce * itemHeight) : "";
			};
			setTransform(currentslide, "translate(0px," + activeMoveY + "px)");
			if(activeMoveY <= 0) {
				var items = currentslide.getElementsByTagName("div");
				for(var i = 0; i < items.length; i++) {
					var top = items[i].offsetTop;
					if(top == Math.abs(activeMoveY) && activeMoveY <= 0) {}
				}
			};
			moveY[index] = activeMoveY;
			if(!p.params.data) {
				switch(parseInt(index)) {
					case 0:
						p.initValue[0] = activeMoveY > 0 ? p.params.minDate :
							p.params.minDate + Math.abs(activeMoveY) / p.params.itemHeight + 1;
						p.drawItem();
						break;
					case 1:
						p.initValue[1] = activeMoveY > 0 ? "1" :
							(Math.abs(activeMoveY) / p.params.itemHeight + 2);
						p.drawItem();
						break;
					case 2:
						p.initValue[2] = activeMoveY > 0 ? "1" :
							(Math.abs(activeMoveY) / p.params.itemHeight + 2);
						break;
				};
				document.querySelector(".picker-selector").innerHTML = p.initValue[0] +
					"-" + format(p.initValue[1]) +
					"-" + format(p.initValue[2]);
			} else {
				var items = currentslide.children;
				var i = activeMoveY > 0 ? 0 : Math.floor(Math.abs(activeMoveY) / p.params.itemHeight) + 1;
				currentslide.setAttribute('data-value', items[i].textContent);
				p.currentSelected[index] = Math.abs(p.params.itemHeight - activeMoveY) / p.params.itemHeight;
				var data = p.params.data.item;
				for(var i = 0; i < p.slides.length; i++) {
					var cs = data[p.currentSelected[i]];
					(i > index) ? drawItem(data, p.currentSelected[i], i): '';
					cs = data[p.currentSelected[i]];
					data = cs ? (cs.child ? cs.child : []) : [];
				};
				var data = p.params.data.item;
				var child = data[p.currentSelected[0]];
				for(var i = 0; i < p.currentSelected.length; i++) {
					p.initValue[i] = child ? (child.name ? child.name : '') : '';
					child = child ? (child.child ? child.child[p.currentSelected[i + 1]] : '') : '';
				}
			};

			function drawItem(data, index, id) {
				var itemList = '';
				for(var i = 0; i < data.length; i++) {
					itemList += '<div class="item" data-id="' + (data[i].id ? data[i].id : '');
					itemList += '" data-val="' + data[i].name + '">' + data[i].name + '</div>';
				};
				p.slides[id].querySelector('.item-list').innerHTML = itemList;
				moveY[id] = p.params.itemHeight;
				p.currentSelected[id] = 0;
				setTransform(p.slides[id].querySelector('.item-list'), 'translate(0px, ' + moveY[id] + 'px)');
			};
			currentslide = null;
			startY = 0;
			document.removeEventListener("touchmove", p.touchmove);
			document.removeEventListener("touchend", p.touchend);
			return;
		};
		p.init();
		return p;
	};
	var setTransform = function(element, animation) {
		element.style.webkitTransform = animation;
		element.style.mozTransform = animation;
		element.style.oTransform = animation;
		element.style.msTransform = animation;
		element.style.transform = animation;
	};
	var transitionEnd = function(elem, handler) {
		elem.addEventListener('transitionend', handler, false);
		elem.addEventListener('webkitTransitionEnd', handler, false);
		elem.addEventListener('mozTransitionEnd', handler, false);
		elem.addEventListener('oTransitionEnd', handler, false);
	};
	var deleteTransitionEnd = function(elem, handler) {
		elem.removeEventListener('transitionend', handler, false);
		elem.removeEventListener('webkitTransitionEnd', handler, false);
		elem.removeEventListener('mozTransitionEnd', handler, false);
		elem.removeEventListener('oTransitionEnd', handler, false);
	};
	var animationEnd = function(elem, handler) {
		elem.addEventListener('animationend', handler, false);
		elem.addEventListener('webkitAnimationEnd', handler, false);
		elem.addEventListener('mozAnimationEnd', handler, false);
		elem.addEventListener('OAnimationEnd', handler, false);
	};
	var deleteAnimationEnd = function(elem, handler) {
		elem.removeEventListener('animationend', handler, false);
		elem.removeEventListener('webkitAnimationEnd', handler, false);
		elem.removeEventListener('mozAnimationEnd', handler, false);
		elem.removeEventListener('OAnimationEnd', handler, false);
	};
	var addEvent = function(dom, type, handle, capture) {
		if(dom.addEventListener) {
			dom.addEventListener(type, handle, capture);
		} else if(dom.attachEvent) {
			dom.attachEvent("on" + type, handle);
		}
	};
	var deleteEvent = function(dom, type, handle) {
		if(dom.removeEventListener) {
			dom.removeEventListener(type, handle);
		} else if(dom.detachEvent) {
			dom.detachEvent('on' + type, handle);
		}
	};
	window.LazyPicker = LazyPicker;
})();
if(typeof(module) !== 'undefined') {
	module.exports = window.LazyPicker;
} else if(typeof define === 'function' && define.amd) {
	define([], function() {
		'use strict';
		return window.LazyPicker;
	});
}