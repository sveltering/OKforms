import { handleError } from './housekeeping/functions.js';
import { OneFormOnlyError } from './housekeeping/errors.js';
import type { OKForm } from './okform.js';
import type { ElementType } from './index.js';
import _Element from './_element.js';
import FragmentElement from './fragmentelement.js';
import { arrayStore, keyValueStore } from '@sveltering/custom-store';

type ElementOpts<Z> = {
	_okform: OKForm<Z>;
	_parentElement: Element<Z>;
	_nodeName: string;
};
class Element<Z> extends _Element<Z> {
	constructor({ _okform, _parentElement, _nodeName }: ElementOpts<Z>) {
		super();
		if (_nodeName === 'FORM') {
			if (!_okform?._form) {
				_parentElement = this;
			} else {
				handleError(OneFormOnlyError);
			}
		}

		this._okform = _okform;
		this._z = _okform._z;
		this._nodeName = _nodeName;
		this._parentElement = _parentElement;
		this.$childElements = arrayStore([]);
		this.$attr = keyValueStore({});
		return this;
	}
	protected createElement(nodeName: string): Element<Z> {
		return new Element({
			_okform: this._okform,
			_parentElement: this,
			_nodeName: nodeName
		});
	}
	protected createFragment(): FragmentElement<Z> {
		return new FragmentElement({
			_okform: this._okform,
			_parentElement: this
		});
	}
	protected __append_or__prepend(
		element: ElementType<Z> | string,
		action: 'push' | 'unshift'
	): ElementType<Z> {
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
	): ElementType<Z> {
		let fragment = this.createFragment();
		if (text !== null || html === null) {
			fragment.text(text || '');
		} else {
			fragment.html(html);
		}
		return <FragmentElement<Z>>this.__append_or__prepend(fragment, action);
	}

	//TEST - OK
	appendHTML(html: string): FragmentElement<Z> {
		return <FragmentElement<Z>>this.__append_or__prepend_fragment(null, html, 'push');
	}
	//TEST - OK
	prependHTML(html: string): FragmentElement<Z> {
		return <FragmentElement<Z>>this.__append_or__prepend_fragment(null, html, 'unshift');
	}
	//TEST - OK
	appendText(text: string): FragmentElement<Z> {
		return <FragmentElement<Z>>this.__append_or__prepend_fragment(text, null, 'push');
	}
	//TEST - OK
	prependText(text: string): FragmentElement<Z> {
		return <FragmentElement<Z>>this.__append_or__prepend_fragment(text, null, 'unshift');
	}
	//TEST - OK
	append(element: string): Element<Z>;
	append(element: Element<Z>): Element<Z>;
	append(element: FragmentElement<Z>): FragmentElement<Z>;
	append(element: string | ElementType<Z>): ElementType<Z> {
		return this.__append_or__prepend(element, 'push');
	}
	//TEST - OK
	prepend(element: string): Element<Z>;
	prepend(element: Element<Z>): Element<Z>;
	prepend(element: FragmentElement<Z>): FragmentElement<Z>;
	prepend(element: string | ElementType<Z>): ElementType<Z> {
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

	input(name: keyof Z | (string & {})): Element<Z> {
		this._okform._names.p;
		return this.append('INPUT').attr('name', name as string);
	}

	submit(fn?: CallableFunction): Element<Z> {
		let input = (this.append('INPUT') as Element<Z>).attr('type', 'submit');
		if (fn) {
			this._okform._form.on('submit', fn);
		}
		return input;
	}
}

export default Element;
export type { ElementOpts };
