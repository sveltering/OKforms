// @ts-nocheck

import { okform } from '$lib';

export const testForm = okform('test');
let form = testForm.form();

let firstname = form.input('fname');
