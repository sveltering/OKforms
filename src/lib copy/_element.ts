import type { ArrayStore, KeyValueStore, WritableStore } from '@sveltering/custom-store';
import type { OKForm, ElementType, Element } from './index.js';

abstract class _Element {
	_okform!: OKForm;
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
	$childElements!: ArrayStore<ElementType>;
	$attr!: KeyValueStore<string | number | boolean>;

	//FRAGMENT ELEMET
	//_isFragment: boolean = true;
	$innerHTML!: WritableStore<string | boolean>;
	$innerText!: WritableStore<string | boolean>;

	constructor() {
		return this;
	}
	get $siblings(): ArrayStore<ElementType> {
		return this._parentElement.$childElements;
	}

	protected static resetIndexes($store: ArrayStore<ElementType>): void {
		let storeArr = $store.value;
		for (let i = 0, iLen = storeArr.length; i < iLen; i++) {
			$store.value[i]._elementIndex = i;
		}
	}

	protected pluckElementFromParent(element: ElementType): ElementType | void {
		if (!element._hasParent) {
			return element;
		}
		let $siblings = element.$siblings;
		let plucked = $siblings.pluck(element._elementIndex);
		_Element.resetIndexes($siblings);
		return plucked;
	}
	protected _insert(element: ElementType, after: boolean = true): this {
		let plucked = <ElementType>this.pluckElementFromParent(this);
		plucked._parentElement = element._parentElement;
		plucked._hasParent = true;
		let $newSiblings = element.$siblings;
		$newSiblings[after ? 'addAfter' : 'addBefore'](element._elementIndex, plucked);
		_Element.resetIndexes($newSiblings);
		return this;
	}

	protected __remove(): void {
		if (this._nodeName === 'FORM') {
			return;
		}

		this.pluckElementFromParent(this);

		let properties = Object.getOwnPropertyNames(this);
		for (let i = 0, iLen = properties.length; i < iLen; i++) {
			if (properties[i][0] === '$') {
				//@ts-ignore
				this[properties[i]]?.destroy?.();
			}
		}
	}
	remove(): void {
		if (this?.$childElements) {
			let _childElements = this.$childElements.value;
			if (_childElements.length) {
				for (let i = 0, iLen = _childElements.length; i < iLen; i++) {
					_childElements[i]?.remove?.();
				}
			}
		}
		this.__remove();
	}
	appendTo(element: Element): this {
		<Element>element.append(this);
		return this;
	}
	prependTo(element: Element): this {
		<Element>element.prepend(this);
		return this;
	}

	insertAfter(element: ElementType): this {
		return this._insert(element, true);
	}
	insertBefore(element: ElementType): this {
		return this._insert(element, false);
	}
	insertStart(): this {
		return this.prependTo(this._parentElement);
	}
	insertEnd(): this {
		return this.appendTo(this._parentElement);
	}
	timeout(callback: CallableFunction, time: number): this {
		this._timeouts.push({ callback, time });
		return this;
	}
	interval(callback: CallableFunction, time: number) {
		this._intervals.push({ callback, time });
		return this;
	}
}

export default _Element;
