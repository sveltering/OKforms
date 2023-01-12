// @ts-nocheck

import { test, runTests } from '$lib/housekeeping/test';
import { okform } from '$lib';

export const testForm = okform('test');
let form = testForm.form();
