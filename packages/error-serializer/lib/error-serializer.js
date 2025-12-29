/**
 * Imports for this file
 * @ignore
 */

/**
 * @async
 * @function errorSerializer
 *
 * @param {Error} [error] - Error Object to be serialized
 *
 * @returns {object} - serialized error object
 *
 * @description
 * Recursively serializes an error till it reaches the leaf nodes.
 * Leaf nodes are defined as errors that are:
 * - Not AggregateError objects
 * - Do not contain a `cause`
 * - Have a `cause` that is not an Error object
 */
const errorSerializer = function errorSerializer(error) {
	let printFullStack = true;
	const serializedError = {
		message: error?.message
	};

	if (error instanceof AggregateError) {
		printFullStack = printFullStack && false;
		serializedError['errors'] = [];
		for (const subError of error?.errors ?? []) {
			serializedError?.['errors']?.push?.(errorSerializer?.(subError));
		}
	}

	if (error?.cause) {
		printFullStack = printFullStack && false;

		if (error.cause instanceof Error) {
			serializedError['cause'] = errorSerializer?.(error.cause);
		} else {
			printFullStack = printFullStack && true;
			serializedError['cause'] = JSON?.stringify?.(
				error.cause,
				undefined,
				'\t'
			);
		}
	}

	for (const customProperty in error) {
		if (!error?.hasOwn?.(customProperty)) continue;
		if (customProperty === 'cause') continue;
		if (customProperty === 'errors') continue;

		if (customProperty instanceof Error) {
			printFullStack = printFullStack && false;

			// eslint-disable-next-line security/detect-object-injection
			serializedError[customProperty] = errorSerializer?.(
				// eslint-disable-next-line security/detect-object-injection
				error?.[customProperty]
			);
		} else {
			// eslint-disable-next-line security/detect-object-injection
			serializedError[customProperty] = JSON?.stringify?.(
				// eslint-disable-next-line security/detect-object-injection
				error?.[customProperty],
				undefined,
				'\t'
			);
		}
	}

	if (printFullStack) {
		const stackArray = error?.stack
			?.split?.('\n')
			?.map?.((stackLocation) => {
				return stackLocation?.trim?.();
			});

		// The first line is redundant...
		stackArray?.shift?.();
		serializedError['stack'] = stackArray;
	}

	return serializedError;
};

const createErrorForPropagation = function createErrorForPropagation(
	message,
	errors
) {
	let propagatedError;

	if (!Array?.isArray?.(errors)) {
		errors = [errors];
	}

	if (errors?.length === 0) {
		propagatedError = new Error(message);
	}

	if (errors?.length === 1) {
		propagatedError = errors[0]
			? new Error(message, {
					cause: errors?.pop?.()
				})
			: new Error(message);
	}

	if (errors?.length > 1) {
		propagatedError = new AggregateError(errors, message);
	}

	return propagatedError;
};

export { createErrorForPropagation, errorSerializer };
