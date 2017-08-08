var Component = require('yacomponent'),
	inheritClass = require('inherit-class');

function Item() {
	this.data = {};
}

inheritClass(Item, Component, 'component');

Item.prototype = $.extend({}, Item.prototype, {
	init: function() {
		Component.prototype.init.call(this);
		this.itemInit();
	},

	itemInit: function() {
		if (this.options.fake) return;
		this.data = $.extend(this.data, this.options.data);
	},
});
Item.prototype.constructor = Item;

Item.defaults = {
	fake: false,
	dName: 'i',
};

module.exports = Item;