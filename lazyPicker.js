/**
 
 @Name : lazyPicker v1.1 移动日期控件
 @Author: TG
 @Date: 2016-12-03
 @Site：http://sentsin.com/layui/laydate
 
 */
(function() {
	'use strict';
	var LazyPicker = function(container, params) {
		if(!(this instanceof LazyPicker)) return new LazyPicker(params);
		var p = this;
		var slide = null;
		var moveY = [];
		var activeMoveY = 0;
		var startY = 0;
		var index = 0;
		var years = [];
		var months = [];
		var days = [];
		var defaults = {
			theme: 'green',
			itemHeight: 40,
			minDate: 1950
		};
		params = params || {};
		var originalParams = {};
		for(var param in params) {
			if(typeof params[param] === 'object' && params[param] !== null && !(params[param].nodeType || params[param] === window || params[param] === document || (typeof Dom7 !== 'undefined' && params[param] instanceof Dom7) || (typeof jQuery !== 'undefined' && params[param] instanceof jQuery))) {
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

		(function setInitDate(p) {
			var curDate = new Date();
			p.initDate = {
				year: curDate.getFullYear(),
				month: curDate.getMonth() + 1,
				day: curDate.getDate()
			};
			if(typeof p.params.initDate === 'string'){
				var d = p.params.initDate.split(/\/|-/gm);
				p.initDate.year = d[0];
				p.initDate.month = d[1];
				p.initDate.day = d[2];
			};
			p.initDate.year = format(p.initDate.year);
			p.initDate.month = format(p.initDate.month);
			p.initDate.day = format(p.initDate.day);
			p.params.maxDate = p.params.maxDate ? p.params.maxDate : parseInt(p.initDate.year) + 20;
			p.initDate.year = parseInt(p.initDate.year) > p.params.maxDate ? p.params.maxDate : p.initDate.year;
			p.params.initDate = p.initDate.date = p.initDate.year + '-' 
					+ p.initDate.month + '-' + p.initDate.day;
		})(p);

		function format(d) {
			d = parseInt(d) >= 10 ? d : '0' + parseInt(d);
			return d;
		};
		//获取当月有多少天
		p.getCountDays = function(d) {
			var curDate = new Date();
			var curMonth = curDate.getMonth();
			/*  生成实际的月份: 由于curMonth会比实际月份小1, 故需加1 */
			curDate.setMonth(curMonth + 1);
			if(typeof d !== 'undefined') {
				curDate = new Date(d);
				curMonth = curDate.getMonth();
				curDate.setMonth(curMonth);
			};
			/* 将日期设置为0*/
			curDate.setDate(32);
			/* 返回当月的天数 */
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
			}, 260);
		};
		p.drawDate = function() {
			var yearList = "";
			for(var i = p.params.minDate; i < p.params.maxDate + 1; i++) {
				years.push(i);
				yearList += '<div class="item" data-val="' + i + '">' + i + '</div>';
			};
			var list = document.querySelectorAll(".item-list");
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
				yearList: yearList,
				monthList: monthList,
				dayList: dayList
			};
		};
		p.confirm = function() {
			if(p.params.clickInput) return;
			var selector = document.querySelector('.picker-selector').innerHTML;
			p.currentDateInput.value = selector;
			p.initDate.date = selector;
			p.params.onChange && p.params.onChange.call(p, p.initDate);
			p.closeModal();
		};
		p.drawItem = function() {
			var num = p.getCountDays(p.initDate.year + "-" + p.initDate.month + "-1");
			var dayList = "";
			var p3 = document.querySelector('.p3');
			for(var i = 1; i < num + 1; i++) {
				days.push(i);
				dayList += '<div class="item" data-val="' + i + '" style="height:' + p.params.itemHeight + 'px;line-height:' + p.params.itemHeight + 'px">' + (i >= 10 ? i : ("0" + i)) + '</div>';
			}
			p3.innerHTML = dayList;
			var dist = (num - 2) * p.params.itemHeight;
			p.initDate.day = (Math.abs(moveY[2]) > dist ? num : p.initDate.day);
			moveY[2] = Math.abs(moveY[2]) > dist ? -dist : moveY[2];
			setTransform(p3, "translate(0px," + moveY[2] + "px)");
		};
		//绘制时间选择器
		p.drawPicker = function() {
			var list = p.drawDate();
			var picker = '<div class="picker-selector">' + p.initDate.date + '</div><div class="picker-wrapper">';
			picker += '<div class="picker-slide"> <div class = "picker-title"> 年 </div><div class="item-box">';
			picker += '<div class="item-list p1"> ' + list.yearList + '</div>';
			picker += '<div class="picker-overlay"></div> <div class="picker-line"></div></div></div>';
			picker += '<div class="picker-slide"> <div class="picker-title">月</div> <div class="item-box">';
			picker += '<div class="item-list p2"> ' + list.monthList + "</div>";
			picker += '<div class="picker-overlay"></div><div class="picker-line"></div></div></div>';
			picker += '<div class="picker-slide"> <div class="picker-title">日</div> <div class="item-box">';
			picker += '<div class="item-list p3"> ' + list.dayList + '</div>';
			picker += '<div class="picker-overlay"></div> <div class="picker-line"></div></div></div></div>';
			picker += '<div class="picker-tool"><div class="picker-button"><span class="picker-cancel">取消</span></div>';
			picker += '<div class="picker-button"><span class="picker-confirm">确认</span></div></div>';
			p.container = document.createElement("div");
			p.container.className = "picker-container";
			p.container.innerHTML = picker;
			document.body.appendChild(p.container);
			p.container.classList.add('theme-' + p.params.theme);
			var overlay = document.querySelectorAll(".picker-overlay");
			if(document.querySelector(".item-list .item") != undefined) {
				var items = document.querySelectorAll(".item-list .item");
				for(var i = 0; i < items.length; i++) {
					items[i].style.height = p.params.itemHeight + "px";
					items[i].style.lineHeight = p.params.itemHeight + "px";
				};
				for(var i = 0; i < overlay.length; i++) {
					overlay[i].addEventListener("touchstart", p.touchstart);
					overlay[i].setAttribute("data-index", i);
					moveY.push(0);
					overlay[i].parentNode.style.height = p.params.itemHeight * 3 + "px";
				};
				var years = p.params.minDate > parseInt(p.initDate.year) ? 0 :
					(parseInt(p.initDate.year) - p.params.minDate - 1);
				moveY[0] = -years * p.params.itemHeight;
				setTransform(document.querySelector(".p1"), "translate(0px," + moveY[0] + "px)");
				moveY[1] = -(p.initDate.month - 2) * p.params.itemHeight;
				setTransform(document.querySelector(".p2"), "translate(0px," + moveY[1] + "px)");
				moveY[2] = -(parseInt(p.initDate.day) - 2) * p.params.itemHeight;
				setTransform(document.querySelector(".p3"), "translate(0px," + moveY[2] + "px)");
			};
			var confirm = document.querySelector('.picker-confirm');
			addEvent(confirm, 'click', p.confirm, false);
			var cancel = document.querySelector('.picker-cancel');
			addEvent(cancel, 'click', p.closeModal, false);
			p.openPicker();
			p.openModalOverlap();
		};
		//初始化
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
		//touchstart
		p.touchstart = function(e) {
			var e = e || window.event;
			var touch = e.touches[0];
			index = this.getAttribute("data-index");
			startY = touch.pageY;
			slide = this.previousElementSibling;
			activeMoveY = moveY[index];
			document.addEventListener("touchmove", p.touchmove);
			document.addEventListener("touchend", p.touchend);
		};
		//touchmove
		p.touchmove = function(e) {
			var e = e || window.event;
			var touch = e.touches[0];
			var eY = touch.pageY;
			activeMoveY += eY - startY;
			startY = eY;
			setTransform(slide, "translate(0px," + activeMoveY + "px)");
		};
		//touchend
		p.touchend = function(e) {
			var pHeight = slide.offsetHeight;
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
			setTransform(slide, "translate(0px," + activeMoveY + "px)");
			if(activeMoveY <= 0) {
				var items = slide.getElementsByTagName("div");
				for(var i = 0; i < items.length; i++) {
					var top = items[i].offsetTop;
					if(top == Math.abs(activeMoveY) && activeMoveY <= 0) {}
				}
			};
			moveY[index] = activeMoveY;
			switch(parseInt(index)) {
				case 0:
					p.initDate.year = activeMoveY > 0 ? p.params.minDate :
						p.params.minDate + Math.abs(activeMoveY) / p.params.itemHeight + 1;
					break;
				case 1:
					p.initDate.month = activeMoveY > 0 ? "1" :
						(Math.abs(activeMoveY) / p.params.itemHeight + 2);
					p.drawItem();
					break;
				case 2:
					p.initDate.day = activeMoveY > 0 ? "1" :
						(Math.abs(activeMoveY) / p.params.itemHeight + 2);
					break;
			};
			document.querySelector(".picker-selector").innerHTML = p.initDate.year +
				"-" + format(p.initDate.month) +
				"-" + format(p.initDate.day);
			slide = null;
			startY = 0;
			document.removeEventListener("touchmove", p.touchmove);
			document.removeEventListener("touchend", p.touchend);
			return;
		};

		p.init();
		return p;
	};
	//设置transform过渡属性
	var setTransform = function(element, animation) {
		element.style.webkitTransform = animation;
		element.style.mozTransform = animation;
		element.style.oTransform = animation;
		element.style.msTransform = animation;
		element.style.transform = animation;
	};
	//过渡结束监听
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
	//动画结束监听
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

	//	var initPagePicker = function(params) {
	//		currentDateInput = this;
	//		return new Picker(params);
	//	};
	//	(function() {
	//		var picker = document.getElementsByClassName('date-picker');
	//		for(var i = 0; i < picker.length; i++) {
	//			picker[i].readOnly = true;
	//			addEvent(picker[i], 'click', initPagePicker, false);
	//		};
	//	})();
	window.LazyPicker = LazyPicker;
})();
if (typeof(module) !== 'undefined')
{
    module.exports = window.LazyPicker;
}
else if (typeof define === 'function' && define.amd) {
    define([], function () {
        'use strict';
        return window.LazyPicker;
    });
}