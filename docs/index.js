/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* global hljs */

import { jassToTS } from "https://cdn.pika.dev/jass-to-ts";

const input = document.querySelector( "textarea" );
const code = document.querySelector( "code" );

const calculate = () => {

	try {

		code.textContent = jassToTS( input.value );
		hljs.highlightBlock( code );

	} catch ( err ) {

		code.textContent = err;

	}

};

const placeholder = `//===========================================================================
function DistanceBetweenPoints takes location locA, location locB returns real
    local real dx = GetLocationX(locB) - GetLocationX(locA)
    local real dy = GetLocationY(locB) - GetLocationY(locA)
    return SquareRoot(dx * dx + dy * dy)
endfunction`;

input.value = placeholder;
input.setAttribute( "placeholder", placeholder );
calculate();
input.value = "";

input.addEventListener( "keyup", calculate );
