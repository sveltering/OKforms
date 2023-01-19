<script lang="ts">
	import OKform from '$lib/components/OKform.svelte';
	import { testForm } from './form';

	let form = testForm.form();
	let username = form.input('username');
	let email = form.input('email');
	let password = form.input('password');

	let selectError = form.appendText('');
	let select = form.append('select').attrs({
		multiple: true,
		name: 'number'
	});

	select.append('option').appendText('ONE');
	select.append('option').appendText('TWO');
	select.append('option').appendText('THREE');
	select.append('option').appendText('FOUR');

	form.on(
		'input',
		(event: any) => {
			let validation = testForm.validate(event.target.name);
			console.log(validation);
			if (validation.success) {
				selectError.empty();
			} else {
				selectError.text(validation.error.issues[0].message);
			}
		},
		{ debounce: 500 }
	);
	form.submit((event) => {
		event.preventDefault();
		let submission = testForm.validate();
		console.log(submission);
	});
</script>

<OKform okform={testForm} />
