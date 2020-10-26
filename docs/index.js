/* global hljs */

import { jassToTS } from "https://cdn.skypack.dev/jass-to-ts";
import Pako from "https://cdn.skypack.dev/pako";

const input = document.querySelector("textarea");
const code = document.querySelector("code");

const compressUrl = (string) => btoa(Pako.deflate(string, { to: "string" }));
const decompressUrl = (string) => Pako.inflate(atob(string), { to: "string" });

const INSTANT_THRESHOLD = 17;
const RATE_LIMIT_THRESHOLD = 250;

let lastDuration = 0;
let lastTime = 0;
let timeout;
let calculating = false;
let followUp = false;

const calculate = () => {
	calculating = true;
	const start = Date.now();
	try {
		const jass = input.value || placeholder;
		if (jass !== placeholder) location.hash = compressUrl(jass);
		else location.hash = "";
		code.textContent = jassToTS(jass);
		hljs.highlightBlock(code);
	} catch (err) {
		code.textContent = err;
	}
	lastTime = Date.now();
	lastDuration = lastTime - start;
	console.log(lastDuration);
	calculating = false;

	if (followUp) {
		followUp = false;
		onInput();
	}
};

const placeholder = `//===========================================================================
function DistanceBetweenPoints takes location locA, location locB returns real
    local real dx = GetLocationX(locB) - GetLocationX(locA)
    local real dy = GetLocationY(locB) - GetLocationY(locA)
    return SquareRoot(dx * dx + dy * dy)
endfunction`;

const getInitial = () => {
	const hash = location.hash.slice(1);
	if (!hash) return placeholder;
	return decompressUrl(hash);
};

const initial = getInitial();
input.value = initial || placeholder;
input.setAttribute("placeholder", placeholder);
calculate();
if (initial === placeholder) input.value = "";

const onInput = () => {
	if (calculating) followUp = true;

	// If it's fast, update instantly
	if (lastDuration < INSTANT_THRESHOLD) return calculate();

	// If it's moderate, update at most once every 250ms
	if (lastDuration < RATE_LIMIT_THRESHOLD) {
		clearTimeout(timeout);
		if (lastTime + RATE_LIMIT_THRESHOLD < Date.now()) calculate();
		else
			timeout = setTimeout(
				calculate,
				lastTime + RATE_LIMIT_THRESHOLD - Date.now(),
			);
		return;
	}

	// If it's slow, update in 500ms
	clearTimeout(timeout);
	timeout = setTimeout(calculate, RATE_LIMIT_THRESHOLD * 2);
};

input.addEventListener("input", onInput);
