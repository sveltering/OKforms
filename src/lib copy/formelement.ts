import type { OKForm } from './okform.js';
import Element from './element.js';
type FormElementOpts = {
	_okform: OKForm;
	_parentElement: Element;
	_nodeName: string;
	name: string;
};
class FormElement extends Element {
	_name: string;
	_validate!: CallableFunction;
	constructor({ _okform, _parentElement, _nodeName, name }: FormElementOpts) {
		super({ _okform, _parentElement, _nodeName });
		this._name = name;
		return;
	}

	validate(fn: CallableFunction): this {
		this._validate = fn;
		return this;
	}
}

export default FormElement;
export type { FormElementOpts };
