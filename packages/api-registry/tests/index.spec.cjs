describe('API Registry Test Cases', function () {
	it('Global Snooze for 400ms', async function () {
		const chai = await import('chai');
		const assert = chai?.assert;

		const startTime = Date?.now?.();
		// eslint-disable-next-line no-undef
		await snooze?.(400);

		const endTime = Date?.now?.();

		const snoozeTime = endTime - startTime;
		assert?.approximately?.(
			snoozeTime,
			400,
			10,
			`snoozed for ${snoozeTime}ms`
		);
	});
});
