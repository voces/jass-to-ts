/* eslint @typescript-eslint/explicit-function-return-type: 0 */

import { jassToTS } from "../src/jassToTS";

const trimEmptyLines = ( str: string ) => {

	const lines = str.split( "\n" );

	let start = 0;
	while ( start < lines.length && lines[ start ].trim() === "" )
		start ++;

	if ( start === lines.length ) return "";

	let end = lines.length - 1;
	while ( end >= 0 && lines[ end ].trim() === "" )
		end --;

	if ( end === - 1 ) return "";

	return lines.slice( start, end + 1 ).join( "\n" );

};

const trim = ( str: string ) => {

	const lines = trimEmptyLines( str );
	const match = lines.match( /\s+/ );
	if ( match ) {

		const indent = match[ 0 ];
		const regex = new RegExp( "^" + indent );
		return lines
			.split( "\n" )
			.map( line => line.replace( regex, "" ) )
			.join( "\n" );

	}

	return lines;

};

const testProgram = ( name: string, jass: string ) =>
	test( name, () => expect( jassToTS( trim( jass ) ) ).toMatchSnapshot() );

testProgram( "globals", `
	globals

		// my numbers
		constant real testNumber = 7.12

		// my strings
		string testString = "myString"

		// stress tests
		unit  array    myUnits //tehe

	endglobals
` );

testProgram( "simple", `
	globals
		//comment
		unit udg_blah = null
	endglobals

	function myFunc takes integer i, boolean b returns nothing
		local unit someUnit = GetSummonedUnit()
		if unit == null then
			set unit = CreateUnit( Player(0), 'hfoo', 0, 0, 0 )
			set udg_blah = unit
		endif
		if R2I(GetUnitX(unit)) < i then
			call ShowUnit(unit, b)
		endif
		loop
			exitwhen i > 10
			set i = i + 1
		endloop
	endfunction
` );

testProgram( "empty function", `
	function InitGlobals takes nothing returns nothing
	endfunction
` );

testProgram( "debug statements", `
	function MyFunc takes nothing returns nothing
		debug call BJDebugMsg("hello, world!")
	endfunction
` );

testProgram( "multiline comments", `
	/**
	 * Blah blah blah
	 * @param arg1 Blah blah blah
	 */
	function MyFunc takes string arg1 returns nothing
	endfunction
` );
