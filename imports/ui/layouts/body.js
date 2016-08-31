import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating';
import { ReactiveDict } from 'meteor/reactive-dict';

import { Lists } from '/imports/api/lists.js';
import { Tasks } from '/imports/api/tasks.js';

import '../components/task.js';
import '../components/list.js';
import './body.styl';
import './body.jade';

Template.body.onCreated(function bodyOnCreated() {
 	this.state = new ReactiveDict();
 	Meteor.subscribe('lists');
	Meteor.subscribe('tasks');
	Session.set("sort_order", {createdAt: -1 });
});

Template.body.onRendered(function() {
	this.$('.ui.dropdown').dropdown();
});

Template.body.helpers({
	// HELPER TASKS: Cache les taches complètées
	tasks() {
		const instance = Template.instance();
		Session.set("sort_order", {createdAt: -1 });

		if (instance.state.get('hideCompleted')) {
			return Tasks.find({ checked: { $ne: true } }, { sort: Session.get("sort_order") });
		}
		return Tasks.find({}, { sort: Session.get("sort_order")});
	},

	lists() {
		return Lists.find({}, { sort: { createdAt: -1 } });
	},

	// HELPER TASKS: Compte le nombre de taches
	incompleteCount() {
		return Tasks.find({ checked: { $ne: true } }).count();
	},

});

Template.body.events({

	// Submit a new task with the form button
	'submit .new-task' (event) {
		event.preventDefault();

		const target = event.target;
		const text = target.text.value;
		const privacy = $('.ui.dropdown.privacy').dropdown("get text") === "Public" ? false : true;
		const priority = Number($('.ui.dropdown.priority').dropdown("get value"));

		Meteor.call('tasks.insert', text, privacy, priority);

		target.text.value = '';
		$('.ui.dropdown.priority').dropdown('restore defaults');
		$('.ui.dropdown.privacy').dropdown('restore defaults');
	},

	// Submit a new list in the list form
	'submit .new-list' (event) {
		event.preventDefault();

		const target = event.target;
		const list = target.text.value;

		Meteor.call('lists.insert', list);

		target.text.value = '';
	},

	// Hide completed tasks with the radio button in header
	'change .hide-completed input'(event, instance) {
		instance.state.set('hideCompleted', event.target.checked);
	},
});