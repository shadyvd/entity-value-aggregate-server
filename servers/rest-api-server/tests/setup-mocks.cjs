const SERVER_NAME =
	process.env.SERVER_NAME || 'Entity Value Aggregate Server by Twyr';
process.title = SERVER_NAME;

global.snooze = async (ms) => {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
};
