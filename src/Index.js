var Component = require('yacomponent'),
	inheritClass = require('inherit-class'),
	Item = Collection.Item = require('./Item');

function Collection() {
	this.items = [];

	this.fakeItem = undefined;
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
		return this.items.filter(function(item) {
			return item.$el[0] === el || item.$el.find(el).length;
		})[0];
	},

	getItemDName: function() {
		return this.options.Item.defaults.dName;
	},

	defineItems: function() {
		var self = this;
		this.$items = this.options.parent.find(this.getItemDName());
		this.setLimit();
		this.$items.each(this.define.bind(this));
	},

	define: function(i, el) {
		this.add(this.make(el));
	},

	make: function(el) {
		var $el = $(el);
		var data = $el.data(this.options.parent.dName + '-' + this.options.Item.defaults.dName);
		return this.initItem({$el: $el, data: data});
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
		var self = this;
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
	},

	initItem: function(options) {
		options = $.extend({
			dName: this.options.parent.makeName(this.getItemDName()),
			template: this.options.itemTemplate
		}, options, this.getItemOptions());
		return this.options.Item.init(options);
	},

	getItemOptions: function() {
		return {};
	},

	clear: function() {
		this.items.forEach(function(i) {
			i.$el.remove();
		});
		this.items = [];
	},

	getData: function() {
		return this.items.map(function(i) {
			return i.data;
		});
	},
});
Collection.prototype.constructor = Collection;

module.exports = Collection;