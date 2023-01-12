import { handleError } from './housekeeping/functions.js';
import { OneFormOnlyError } from './housekeeping/errors.js';
import { writableStore, type WritableStore } from '@sveltering/custom-store';
import { arrayStore, type ArrayStore } from '@sveltering/custom-store';
import { keyValueStore, type KeyValueStore } from '@sveltering/custom-store';

let okformInstanes: { [formName: string]: _okform } = {};

export class _okform {
	_name!: string;
	_form!: Element;
	constructor(_name: string) {
		if (okformInstanes.hasOwnProperty(_name)) {
			return okformInstanes[_name];
		}
		okformInstanes[_name] = this;
		this._name = _name;
		this._form = new Element(this, null, 'FORM');
		return this.init();
	}
	init(): this {
		return this;
	}
	//TEST - OK
	form(): Element {
		return this._form;
	}
}

export type T_Element = Element | FragmentElement | _Element;

abstract class _Element {
	_okform!: _okform;
	_parentElement!: Element;
	_elementIndex: number = 0;
	_hasParent: boolean = false;
	_events: { [eventName: string]: { callback: CallableFunction; options: {} }[] } = {};
	_timeouts: { callback: CallableFunction; time: number; timeoutId?: number }[] = [];
	_intervals: { callback: CallableFunction; time: number; intervalId?: number }[] = [];

	//ELEMENT
	static _form: Element;
	_nodeName!: string;
	_isFragment: boolean = false;
	$childElements!: ArrayStore<T_Element>;
	$attr!: KeyValueStore<string | number | boolean>;

	//FRAGMENT ELEMET
	//_isFragment: boolean = true;
	$innerHTML!: WritableStore<string | boolean>;
	$innerText!: WritableStore<string | boolean>;

	constructor(...args: any[]) {
		return this.init(...args);
	}
	protected init(...args: any[]) {
		return this;
	}
	get $siblings(): ArrayStore<T_Element> {
		return this._parentElement.$childElements;
	}

	static resetIndexes($store: ArrayStore<T_Element>): void {
		let storeArr = $store.value;
		for (let i = 0, iLen = storeArr.length; i < iLen; i++) {
			$store.value[i]._elementIndex = i;
		}
	}

	//TEST - OK
	appendTo(element: Element): this {
		<Element>element.append(this);
		return this;
	}
	//TEST - OK
	prependTo(element: Element): this {
		<Element>element.prepend(this);
		return this;
	}

	protected _insert(element: T_Element, after: boolean = true): this {
		let plucked = <T_Element>this.pluckElementFromParent(this);
		plucked._parentElement = element._parentElement;
		plucked._hasParent = true;
		let $newSiblings = element.$siblings;
		$newSiblings[after ? 'addAfterIndex' : 'addBeforeIndex'](element._elementIndex, plucked);
		_Element.resetIndexes($newSiblings);
		return this;
	}

	//TEST - OK
	insertAfter(element: T_Element): this {
		return this._insert(element, true);
	}
	//TEST - OK
	insertBefore(element: T_Element): this {
		return this._insert(element, false);
	}
	//TEST - OK
	insertStart(): this {
		return this.prependTo(this._parentElement);
	}
	//TEST - OK
	insertEnd(): this {
		return this.appendTo(this._parentElement);
	}

	protected pluckElementFromParent(element: T_Element): T_Element | void {
		if (!element._hasParent) {
			return element;
		}
		let $siblings = element.$siblings;
		let plucked = $siblings.pluck(element._elementIndex);
		_Element.resetIndexes($siblings);
		return plucked;
	}
	protected __remove(): void {
		if (this._nodeName === 'FORM') {
			return;
		}

		this.pluckElementFromParent(this);

		let properties = Object.getOwnPropertyNames(this);
		for (let i = 0, iLen = properties.length; i < iLen; i++) {
			//@ts-ignore
			if (properties[i][0] !== '$' || !(this[properties[i]] instanceof CustomStore)) {
				continue;
			}
			//@ts-ignore
			this[properties[i]].destroy();
		}
	}
	//TEST - OK
	remove(): void {
		if (this?.$childElements) {
			let _childElements = this.$childElements.getAll();
			if (_childElements.length) {
				for (let i = 0, iLen = _childElements.length; i < iLen; i++) {
					_childElements[i]?.remove?.();
				}
			}
		}
		this.__remove();
	}
	//TEST - YTC
	timeout(callback: CallableFunction, time: number): this {
		this._timeouts.push({ callback, time });
		return this;
	}
	//TEST - YTC
	interval(callback: CallableFunction, time: number) {
		this._intervals.push({ callback, time });
		return this;
	}
}

type lifeCycleEvents = 'mount' | 'destroy' | 'afterUpdate' | 'beforeUpdate';
export class Element extends _Element {
	constructor(...args: any[]) {
		super(...args);
		return this;
	}
	protected init(_okform: _okform, _parentElement: Element, _nodeName: string): this {
		if (_nodeName === 'FORM') {
			if (Element._form === undefined) {
				Element._form = this;
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
		return new Element(this._okform, this, nodeName);
	}
	protected createFragment(): FragmentElement {
		return new FragmentElement(this._okform, this);
	}
	protected __append_or__prepend(
		element: T_Element | string,
		action: 'push' | 'unshift'
	): T_Element {
		if (typeof element === 'string') {
			element = this.createElement(element);
		}
		this.pluckElementFromParent(element);
		element._parentElement = this;
		element._hasParent = true;
		let $childElements = this.$childElements;
		$childElements[action](element);
		_Element.resetIndexes($childElements);
		return element;
	}
	protected __append_or__prepend_fragment(
		text: string | null,
		html: string | null,
		action: 'push' | 'unshift'
	): T_Element {
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
	append(element: string | T_Element): T_Element {
		return this.__append_or__prepend(element, 'push');
	}
	//TEST - OK
	prepend(element: string | T_Element): T_Element {
		return this.__append_or__prepend(element, 'unshift');
	}
	//TEST - OK
	attr(attrName: string, value: string | number | boolean): this {
		this.$attr.set(attrName, value);
		return this;
	}
	//TEST - OK
	attrs(attrs: { [key: string]: string | number | boolean }): this {
		this.$attr.setAll(attrs);
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
}

export class FragmentElement extends _Element {
	_isFragment: boolean = true;

	constructor(...args: any[]) {
		super(...args);
		return this;
	}

	protected init(_okform: _okform, _parentElement: Element) {
		this._okform = _okform;
		this._parentElement = _parentElement;
		this.$innerHTML = writableStore('');
		this.$innerText = writableStore('');
		return this;
	}

	//TEST - OK
	html(_innerHTML: string) {
		this.$innerText.set(false);
		this.$innerHTML.set(_innerHTML);
		return this;
	}
	//TEST - OK
	text(_innerText: string) {
		this.$innerHTML.set(false);
		this.$innerText.set(_innerText);
		return this;
	}
	//TEST - OK
	on(event: lifeCycleEvents, callback: CallableFunction, options: {} = {}): this {
		if (!this._events.hasOwnProperty(event)) {
			this._events[event] = [];
		}
		this._events[event].push({ callback, options });
		return this;
	}
}

export default function okform(name: string): _okform {
	return new _okform(name);
}
