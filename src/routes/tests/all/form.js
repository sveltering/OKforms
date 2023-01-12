// @ts-nocheck

import { test, runTests } from '$lib/housekeeping/test';
import { okform } from '$lib';

export const testForm = okform('test');
let form = testForm.form();

test('See if form element is created.', ({ success, fail }) => {
	let forms = document.querySelectorAll('form');
	if (forms.length) {
		success();
		return;
	}
	fail();
});

test('.attr() method', async ({ success, fail, tick }) => {
	form.attr('id', 'TESTID');
	await tick();
	let formById = document.querySelector('#TESTID');
	if (formById) {
		success();
		return;
	}
	fail();
});

test('.attrs() method', async ({ success, fail, tick }) => {
	let attrs = {
		id: 'TESTID',
		class: 'myform',
		test1: 1,
		testBool: true
	};
	form.attrs(attrs);
	await tick();

	let formById = document.querySelector('#TESTID');

	for (let attrName in attrs) {
		let attr = attrs[attrName].toString();
		let setattr = formById.getAttribute(attrName);
		if (attr !== setattr) {
			fail(
				`Failed to set attribute ${attrName}=\"${attr}\" instead attribute value was ${setattr}`
			);
			return;
		}
	}
	success();
});

let div1, span1;
test('.append() method', async ({ success, fail, tick }) => {
	div1 = form.append('div');
	div1.attr('class', 'div1');

	span1 = div1.append('span');
	span1.attr('class', 'span1');

	await tick();
	if (document.querySelectorAll('form > div.div1 > span.span1').length) {
		success();
		return;
	}
	fail();
});

let span2;
test('.prepend() method', async ({ success, fail, tick }) => {
	span2 = div1.prepend('span');
	span2.attr('class', 'span2');

	await tick();
	if (document.querySelectorAll('form > div.div1 > span.span2 + span.span1').length) {
		success();
		return;
	}
	fail();
});

test('.appendHTML() method', async ({ success, fail, tick }) => {
	span1.appendHTML(`<div class="span1div1"></div>`);
	await tick();
	if (document.querySelectorAll('form span.span1 > .span1div1').length) {
		success();
		return;
	}
	fail();
});

test('.prependHTML() method', async ({ success, fail, tick }) => {
	span1.prependHTML(`<div class="span1div2"></div>`);
	await tick();
	if (document.querySelectorAll('form span.span1 > .span1div2 + .span1div1').length) {
		success();
		return;
	}
	fail();
});

let appendTEXT = `TEST APPEND TEXT`;
let appendTextFrag;
test('.appendText() method', async ({ success, fail, tick }) => {
	appendTextFrag = span1.appendText(appendTEXT);
	await tick();
	if (document.querySelectorAll('form span.span1')[0].innerText === appendTEXT) {
		success();
		return;
	}
	fail();
});
let prependTEXT = `TEST PREPEND TEXT`;
let prependTextFrag;
test('.prependText() method', async ({ success, fail, tick }) => {
	prependTextFrag = span1.prependText(prependTEXT);
	await tick();
	if (document.querySelectorAll('form span.span1')[0].innerText.indexOf(prependTEXT) > -1) {
		success();
		return;
	}
	fail();
});

let div2;
let span3;
test('.appendTo() method', async ({ success, fail, tick }) => {
	div2 = form.append('div');
	div2.attr('class', 'div2');

	span3 = div1.append('span');
	span3.attr('class', 'span3');

	span3.appendTo(div2);
	appendTextFrag.appendTo(span2);
	await tick();

	if (
		!document.querySelectorAll('div.div1 span.span3').length &&
		document.querySelectorAll('div.div2 span.span3').length &&
		document.querySelectorAll('form span.span2')[0].innerText === appendTEXT
	) {
		success();
		return;
	}
	fail();
});
test('.prependTo() method', async ({ success, fail, tick }) => {
	span1.prependTo(div2);
	prependTextFrag.prependTo(span2);
	await tick();
	if (
		document.querySelectorAll('div.div2 > span.span1 + span.span3').length &&
		document.querySelectorAll('form span.span2')[0].innerText.indexOf(prependTEXT) > -1
	) {
		success();
		return;
	}
	fail();
});
test('.remove() method', async ({ success, fail, tick }) => {
	span2.remove();
	await tick();
	span1.insertAfter(div1);
	if (!document.querySelectorAll('span.span2').length) {
		success();
		return;
	}
	fail();
});
runTests();
