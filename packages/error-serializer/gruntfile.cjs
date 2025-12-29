'use strict';

module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		coveralls: {
			// Options relevant to all targets
			options: {
				force: true
			},

			common: {
				src: 'buildresults/coverage/lcov.info',
				options: {
					// Any options for just this target
				}
			}
		},

		env: {
			mochaTest: {
				NODE_ENV: 'test'
			}
		},

		eslint: {
			options: {
				format: 'junit',
				outputFile: 'buildresults/eslint-orig.xml'
			},
			target: ['.']
		},

		exec: {
			clean: {
				command: 'npm run clean'
			},
			'consolidate-build': {
				command:
					'mkdir -p ./../../buildresults/error-serializer && rm -rf  ./../../buildresults/error-serializer && mv ./buildresults ./../../buildresults/error-serializer'
			},
			'consolidate-docs': {
				command:
					'mkdir -p ./../../docs/error-serializer && rm -rf ./../../docs/error-serializer && mv ./docs/api ./../../docs/error-serializer && rm -rf ./docs'
			},
			deps: {
				command: 'npm run deps'
			},
			docs: {
				command: 'npm run docs'
			},
			'organize-build-results': {
				command:
					'mkdir -p ./buildresults/mocha && mkdir -p ./buildresults/eslint && mv ./buildresults/lint.xml ./buildresults/eslint/results.xml && mv ./buildresults/test-results.xml ./buildresults/mocha/results.xml && mv ./coverage ./buildresults && mv ./.nyc_output ./buildresults && mv ./depcruise ./buildresults && cp ./buildresults/depcruise/architecture.svg ./docs/api && mv ./stats ./buildresults && cp ./buildresults/stats/LINES_OF_CODE.md ./docs/api'
			},
			'lint-fix': {
				command: 'npm run lint:fix'
			},
			'rename-docs': {
				command:
					'mkdir -p ./jsdoc_default/<%= pkg.name %>/<%= pkg.version %> &&  mv ./jsdoc_default/<%= pkg.name %>/<%= pkg.version %> ./docs/api && rm -rf ./jsdoc_default'
			},
			stats: {
				command: 'npm run stats'
			},
			test: {
				command: 'npm run test && mv ./test-results.xml ./buildresults'
			}
		},

		xmlstoke: {
			deleteESLintBugs: {
				options: {
					actions: [
						{
							type: 'D',
							xpath: "//failure[contains(@message, 'node_modules')]/ancestor::testsuite"
						}
					]
				},
				files: {
					'buildresults/eslint-no-bugs.xml':
						'buildresults/eslint-orig.xml'
				}
			},
			deleteEmptyTestcases: {
				options: {
					actions: [
						{
							type: 'D',
							xpath: '//testcase[not(node())]'
						}
					]
				},
				files: {
					'buildresults/eslint-no-empty-testcases.xml':
						'buildresults/eslint-no-bugs.xml'
				}
			},
			deleteEmptyTestsuites: {
				options: {
					actions: [
						{
							type: 'D',
							xpath: '//testsuite[not(descendant::testcase)]'
						}
					]
				},
				files: {
					'buildresults/eslint-no-empty-testsuites.xml':
						'buildresults/eslint-no-empty-testcases.xml'
				}
			},
			prettify: {
				options: {
					actions: [
						{
							type: 'U',
							xpath: '//text()'
						}
					]
				},
				files: {
					'buildresults/lint.xml':
						'buildresults/eslint-no-empty-testsuites.xml'
				}
			}
		},

		jsbeautifier: {
			src: ['buildresults/**/*.xml', 'docs/**/*.html'],
			options: {
				config: '.jsbeautifyrc'
			}
		},

		clean: [
			'buildresults/eslint-orig.xml',
			'buildresults/eslint-no-bugs.xml',
			'buildresults/eslint-no-empty-testcases.xml',
			'buildresults/eslint-no-empty-testsuites.xml',
			'buildresults/coverage.raw.json'
		]
	});

	grunt.loadNpmTasks('grunt-env');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-xmlstoke');
	grunt.loadNpmTasks('grunt-jsbeautifier');
	// grunt.loadNpmTasks('grunt-coveralls');

	grunt.registerTask('default', [
		'exec:clean',
		'env',
		'exec:lint-fix',
		'eslint',
		'exec:test',
		'exec:docs',
		'exec:deps',
		'exec:stats',
		'xmlstoke:deleteESLintBugs',
		'xmlstoke:deleteEmptyTestcases',
		'xmlstoke:deleteEmptyTestsuites',
		'xmlstoke:prettify',
		'exec:rename-docs',
		'clean',
		'exec:organize-build-results',
		'jsbeautifier',
		// 'coveralls',
		'exec:consolidate-build',
		'exec:consolidate-docs'
	]);
};
