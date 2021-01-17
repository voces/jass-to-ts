#!/usr/bin/env node

import fs from "fs";

import { jassToTS } from "./jassToTS.js";

const filePath = process.argv[2];

if (!filePath) {
	console.error("You must specify a jass file to convert");
	console.error("Usage: jassToTS path/to/war3map.j");
	process.exit(1);
}

fs.readFile(filePath, "utf-8", (err, res) => {
	if (err) {
		console.error(err.message);
		process.exit(1);
	}

	// eslint-disable-next-line no-console
	console.log(jassToTS(res.replace(/\r/g, "")));
});
