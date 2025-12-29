module.exports = {
	types: [
		{
			value: 'build',
			name: 'build:    Changes to dependencies or gruntfile'
		},
		{ value: 'chore', name: 'chore:    Changes to auxiliary tools' },
		{ value: 'ci', name: 'ci:    Changes to anything devops' },
		{ value: 'docs', name: 'docs:     Documentation only changes' },
		{
			value: 'functionality',
			name: 'functionality:     A new feature - to be used only for closing a ticket/issue'
		},
		{ value: 'fix', name: 'fix:      A bug fix' },
		{
			value: 'perf',
			name: 'perf:     A code change that improves performance'
		},
		{
			value: 'refactor',
			name: 'refactor: A code change that neither fixes a bug nor adds a feature'
		},
		{ value: 'revert', name: 'revert:   Revert to a commit' },
		{
			value: 'style',
			name: 'style:    Changes that do not affect the meaning of the code'
		},
		{ value: 'test', name: 'test:     Adding missing tests' },
		{ value: 'wip', name: 'wip:      Work in progress' }
	],

	scopes: [
		{ name: 'surface' },
		{ name: 'domain' },
		{ name: 'context' },
		{ name: 'module' },
		{ name: 'service' },
		{ name: 'package' },
		{ name: 'server' },
		{ name: 'repository' }
	],

	/*
	// it needs to match the value for field type. Eg.: 'fix'
	scopeOverrides: {
		fix: [

			{name: 'merge'},
			{name: 'style'},
			{name: 'e2eTest'},
			{name: 'unitTest'}
		]
	},
	*/

	// override the messages, defaults are as follows
	messages: {
		type: "Select the type of change that you're committing:",
		scope: '\nDenote the SCOPE of this change (optional):',
		// used if allowCustomScopes is true
		customScope: 'Denote the SCOPE of this change:',
		subject: 'Write a SHORT, IMPERATIVE tense description of the change:\n',
		body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
		breaking: 'List any BREAKING CHANGES (optional):\n',
		footer: 'List any ISSUES CLOSED by this change (optional). E.g.: #31, #34:\n',
		confirmCommit: 'Are you sure you want to proceed with the commit above?'
	},

	allowCustomScopes: false,
	allowBreakingChanges: ['functionality', 'fix', 'refactor', 'revert'],

	// limit subject length
	subjectLimit: 250,

	// skip any questions you want
	// skipQuestions: ['scope', 'body'],

	askForBreakingChangeFirst: true, // default is false
	breaklineChar: '|', // It is supported for fields body and footer.
	footerPrefix: 'ISSUES CLOSED: ',

	allowTicketNumber: true,
	isTicketNumberRequired: true,
	ticketNumberPrefix: '#',
	ticketNumberRegExp: '\\d{1,7}',

	usePreparedCommit: true // to re-use commit from ./.git/COMMIT_EDITMSG
};
