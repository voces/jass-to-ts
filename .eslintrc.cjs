module.exports = {
	extends: ["verit"],
	plugins: ["simple-import-sort"],
	rules: { "simple-import-sort/sort": "error", "no-console": "off" },
	parserOptions: { project: "./tsconfig.json", tsconfigRootDir: __dirname },
};
