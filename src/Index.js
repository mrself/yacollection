var Component = require('yacomponent'),
	inheritClass = require('inherit-class'),
	Item = Collection.Item = require('./Item');

function Collection() {
	this.items = [];

	this.fakeItem = undefined;

	this.lastIndex = 0;
}

Collection.defaults = {
	dName: 'list',
	parent: null,
	Item: Item
};

inheritClass(Collection, Component, 'component');

Collection.prototype = $.extend({}, Collection.prototype, {
	init: function() {
		this.items = [];
		this.defineParentName();
		Component.prototype.init.call(this);
		this.makeFakeItem();
		this.defineItems();
		this.defineEvents();
	},

	makeFakeItem: function() {
		this.fakeItem = this.initItem({$el: $([]), fake: true, instance: false});
	},

	defineParentName: function() {
		if (this.options.parent) return;
		this.options.parent = this;
	},

	defineEvents: function() {
		var self = this;
		this.$el.on('click', this.elDel('makeSelector', 'remove'), function(e) {
			e.preventDefault();
			self.onRemove(e);
		});
		$('.' + this.options.dName + 'Add').on('click', function(e) {
			e.preventDefault();
			self.clickAdd();
		});
	},

	elDel: function(method, arg) {
		var args = [this.getItemDName()];
		args.push(arg);
		return this.options.parent[method].call(this.options.parent, args);
	},

	onRemove: function(event) {
		var item = this.getByEl(event.currentTarget);
		this.remove(item);
	},

	getByEl: function(el) {
		el = el instanceof $ ? el[0] : el;
		return this.items.filter(function(item) {
			return item.$el[0] === el || item.$el.find(el).length;
		})[0];
	},

	getItemDName: function() {
		return this.options.Item.defaults.dName;
	},

	defineItems: function() {
		this.$items = this.options.parent.find(this.getItemDName());
		this.setLimit();
		this.$items.each(this.define.bind(this));
	},

	define: function(i, el) {
		return this.add(this.make(el));
	},

	make: function(el) {
		var $el = $(el);
		return this.initItem({$el: $el});
	},

	setLimit: function() {
		if (!this.options.limit) return;
		this.$items.slice(this.options.limit)
			.detach()
			.each(this.define.bind(this))
			.get();
		this.removedItems = this.items;
		this.items = [];
	},

	add: function(item, insert) {
		insert = typeof insert == 'undefined' ? false : insert;
		this.items.push(item);
		if (insert) this.$el.append(item.$el);
		this.$el.trigger(this.eventName('add'), item);
		return item;
	},

	addByData: function(data) {
		var html = this.render(data);
		var item = this.initItem({$el: $(html), data: data});
		this.add(item, true);
	},

	render: function(data) {
		throw new Error('yacollection: #render is not implemented');
	},

	addPatchByData: function(data) {
		data.forEach(this.addByData.bind(this));
	},

	clickAdd: function() {
		var data = this.getClickAddData();
		this.addByData(data);
	},

	getClickAddData: function() {
		return {};
	},

	remove: function(item) {
		var index = this.items.indexOf(item);
		item.$el.remove();
		this.items.splice(index, 1);
		this.updateIndex();
		this.$el.trigger(this.eventName('remove'), item);
	},

	updateIndex: function() {
		var lastIndex = 0;
		this.items.forEach(function(i) {
			lastIndex = i.data.index = i.$el.index();
		});
		this.lastIndex = lastIndex;
	},

	initItem: function(options) {
		options = $.extend({
			dName: this.options.parent.makeName(this.getItemDName()),
			template: this.options.itemTemplate
		}, options, this.getItemOptions(options));
		return this.options.Item.init(options);
	},

	getItemOptions: function(startingOptions) {
		if (startingOptions.fake) {
			var data = {};
		} else {
			var data = startingOptions.$el
				.data(this.options.parent.dName + '-' + this.options.Item.defaults.dName);
			data = data || {};
			data.index = this.lastIndex++;
		}
		return $.extend(this.options.item, {data: data});
	},

	clear: function() {
		this.items.forEach(function(i) {
			i.$el.remove();
		});
		this.items = [];
		this.lastIndex = 0;
	},

	getData: function() {
		return this.items.map(function(i) {
			return i.data;
		});
	},

	insert: function(html) {
		this.$el[0].innerHTML = html;
		this.items = [];
		this.defineItems();
	},

	append: function(html) {
		var $html = $(html);
		var $items;
		var itemSelector = this.options.parent.makeSelector(this.getItemDName());
		if ($html.is(itemSelector)) $items = $html;
		else $items = $html.find(itemSelector);
		return $items.appendTo(this.$el).map(this.define.bind(this));
	},
});
Collection.prototype.constructor = Collection;

module.exports = Collection;