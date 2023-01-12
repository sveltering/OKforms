import { handleError } from './housekeeping/functions.js';
import { OneFormOnlyError } from './housekeeping/errors.js';
import type { OKForm } from './okform.js';
import type { ElementType } from './index.js';
import _Element from './_element.js';
import FragmentElement from './fragmentelement.js';
import { arrayStore, keyValueStore } from '@sveltering/custom-store';

type ElementOpts = {
	_okform: OKForm;
	_parentElement: Element;
	_nodeName: string;
};
class Element extends _Element {
	constructor({ _okform, _parentElement, _nodeName }: ElementOpts) {
		super();
		if (_nodeName === 'FORM') {
			if (!_okform?._form) {
				_parentElement = this;
			} else {
				handleError(OneFormOnlyError);
			}
		}

		this._okform = _okform;
		this._nodeName = _nodeName;
		this._parentElement = _parentElement;
		this.$childElements = arrayStore([]);
		this.$attr = keyValueStore({});
		return this;
	}
	protected createElement(nodeName: string): Element {
		return new Element({
			_okform: this._okform,
			_parentElement: this,
			_nodeName: nodeName
		});
	}
	protected createFragment(): FragmentElement {
		return new FragmentElement({
			_okform: this._okform,
			_parentElement: this
		});
	}
	protected __append_or__prepend(
		element: ElementType | string,
		action: 'push' | 'unshift'
	): ElementType {
		if (typeof element === 'string') {
			element = this.createElement(element);
		}
		this.pluckElementFromParent(element);
		element._parentElement = this;
		element._hasParent = true;
		let $childElements = this.$childElements;
		$childElements.value[action](element);
		_Element.resetIndexes($childElements);
		return element;
	}
	protected __append_or__prepend_fragment(
		text: string | null,
		html: string | null,
		action: 'push' | 'unshift'
	): ElementType {
		let fragment = this.createFragment();
		if (text !== null || html === null) {
			fragment.text(text || '');
		} else {
			fragment.html(html);
		}
		return <FragmentElement>this.__append_or__prepend(fragment, action);
	}

	//TEST - OK
	appendHTML(html: string): FragmentElement {
		return <FragmentElement>this.__append_or__prepend_fragment(null, html, 'push');
	}
	//TEST - OK
	prependHTML(html: string): FragmentElement {
		return <FragmentElement>this.__append_or__prepend_fragment(null, html, 'unshift');
	}
	//TEST - OK
	appendText(text: string): FragmentElement {
		return <FragmentElement>this.__append_or__prepend_fragment(text, null, 'push');
	}
	//TEST - OK
	prependText(text: string): FragmentElement {
		return <FragmentElement>this.__append_or__prepend_fragment(text, null, 'unshift');
	}
	//TEST - OK
	append(element: string | ElementType): ElementType {
		return this.__append_or__prepend(element, 'push');
	}
	//TEST - OK
	prepend(element: string | ElementType): ElementType {
		return this.__append_or__prepend(element, 'unshift');
	}
	//TEST - OK
	attr(attrName: string, value: string | number | boolean): this {
		this.$attr.value[attrName] = value;
		return this;
	}
	//TEST - OK
	attrs(attrs: { [key: string]: string | number | boolean }): this {
		this.$attr.value = {
			...this.$attr.value,
			...attrs
		};
		return this;
	}
	//TEST - OK
	on(event: string, callback: CallableFunction, options: {} = {}): this {
		if (!this._events.hasOwnProperty(event)) {
			this._events[event] = [];
		}
		this._events[event].push({ callback, options });
		return this;
	}

	input(name: string, type: string = 'text') {
		let input = <Element>this.append('input');
		input.attr('type', type);
	}
}

export default Element;
export type { ElementOpts };
