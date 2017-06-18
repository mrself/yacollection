var Base = require('Services/Component/Base'),
	inheritClass = require('inherit-class');

function Item() {
	
}

inheritClass(Item, Base, 'base');

Item.prototype = $.extend({}, Item.prototype, {
	init: function() {
		Base.prototype.init.call(this);
		if (this.options.fake) return;
		this.data = this.options.data;
	},
});
Item.prototype.constructor = Item;

Item.defaults = {
	fake: false,
	dName: 'i',
};

module.exports = Item;