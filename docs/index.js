/* global hljs */

import { jassToTS } from "https://cdn.skypack.dev/jass-to-ts";
import Pako from "https://cdn.skypack.dev/pako";

const input = document.querySelector("textarea");
const code = document.querySelector("code");

const compressUrl = (string) => btoa(Pako.deflate(string, { to: "string" }));
const decompressUrl = (string) => Pako.inflate(atob(string), { to: "string" });

const calculate = () => {
	try {
		const jass = input.value || placeholder;
		location.hash = compressUrl(jass);
		code.textContent = jassToTS(jass);
		hljs.highlightBlock(code);
	} catch (err) {
		code.textContent = err;
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

input.addEventListener("keyup", calculate);
