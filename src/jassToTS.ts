
import jassToAst, {
	Node,
	List,
	SingleProp,
	ArrayRef,
	BinaryOp,
	Call,
	Comment,
	Else,
	ElseIf,
	// EmptyLine,
	ExitWhen,
	// FourCC,
	FuncRef,
	Globals,
	IfThenElse,
	JASSFunction,
	JASSSet,
	Loop,
	Name,
	// Native,
	Param,
	Parens,
	Program,
	Return,
	Statements,
	// Type,
	UnaryOp,
	Variable,
} from "jass-to-ast";

const handles: Array<string> = [
	// "unit", "player", "group", "string", "force",
];

const jassTypeToTypeScriptType = ( type: Name ): string => {

	let res = type
		.replace( "real", "number" )
		.replace( "integer", "number" );

	if ( handles.includes( res ) ) res += " | null";
	return res;

};

let isVoid = false;

const astToTS = ( ast: Node | List<Node> | SingleProp | string ): string => {

	if ( ast === undefined || ast === null )
		return "null";

	switch ( ast.constructor.name ) {

		case "ArrayRef":
			return `${( ast as ArrayRef ).name}[ ${astToTS( ( ast as ArrayRef ).prop )} ]`;

		case "BinaryOp": {

			const operator = ( ast as BinaryOp ).operator
				.replace( "or", "||" )
				.replace( "and", "&&" )
				.replace( "==", "===" )
				.replace( "!=", "!==" );
			return `${astToTS( ( ast as BinaryOp ).left )} ${operator} ${astToTS( ( ast as BinaryOp ).right )}`;

		} case "Boolean":
		case "Number":
			return ast.toString();

		case "Call":
			return `${( ast as Call ).name}(${( ast as Call ).args ? ` ${[ ...( ast as Call ).args ].map( astToTS ).join( ", " )} ` : ""})`;

		case "Comment":
			return "//" + ( ! ( ast as Comment ).startsWith( " " ) && ( ast as Comment ).length ? " " : "" ) + ast;

		case "Else":
			return `else {\n\n${astToTS( ( ast as Else ).statements )}\n\n}`;

		case "ElseIf":
			return `else if ( ${astToTS( ( ast as ElseIf ).condition )} ) {\n\n${astToTS( ( ast as ElseIf ).statements )}\n\n}`;

		case "EmptyLine":
			return "";

		case "ExitWhen":
			return `if ( ${astToTS( ( ast as ExitWhen ).data[ 0 ] )} ) break;`;

		case "FourCC":
			return `FourCC( "${ast}" )`;

		case "String":
			return `"${ast}"`;

		case "FuncRef":
			return ( ast as FuncRef ).data;

		case "Globals":
			return [ ( ast as Globals ).comment, astToTS( ( ast as Globals ).globals ).split( "\n" ).map( v => v.slice( 1 ) ).join( "\n" ), ( ast as Globals ).endComment ].filter( Boolean ).join( "\n" );

		case "IfThenElse":
			return `\nif ( ${astToTS( ( ast as IfThenElse ).condition )} ) {\n\n${astToTS( ( ast as IfThenElse ).then )}\n\n}${( ast as IfThenElse ).elses ? " " + ( ast as IfThenElse ).elses.map( astToTS ).join( " " ) : ""}\n`;

		case "JASSFunction": {

			if ( ( ast as JASSFunction ).returns === undefined )
				isVoid = true;
			const body = ( ast as JASSFunction ).statements ? `\n\n${astToTS( ( ast as JASSFunction ).statements )}\n\n` : "";
			const r = `const ${( ast as JASSFunction ).name} = (${( ast as JASSFunction ).params ? ` ${[ ...( ast as JASSFunction ).params ].map( astToTS ).join( ", " )} ` : ""}): ${jassTypeToTypeScriptType( ( ast as JASSFunction ).returns || "void" )} => {${body}};\n`;
			isVoid = false;
			return r;

		} case "JASSSet": {

			const name = ( ast as JASSSet ).name.replace( "this", "_this" );
			const prop = ( ast as JASSSet ).prop !== undefined ? `[ ${astToTS( ( ast as JASSSet ).prop as Node )} ]` : "";
			return `${name}${prop} = ${astToTS( ( ast as JASSSet ).value )};`;

		} case "Loop":
			return `\nwhile ( true ) {\n\n${[ ...( ast as Loop ).statements ].map( astToTS ).join( "\n" ).split( "\n" ).map( v => v ? "\t" + v : v ).join( "\n" )}\n\n}\n\n`;

		case "Name":
			return ( ast as Name ).replace( "this", "_this" );

		case "Native":
		case "Type":
			return "";

		case "Param":
			return `${( ast as Param ).name.replace( "this", "_this" )}: ${jassTypeToTypeScriptType( ( ast as Param ).type )}`;

		case "Parens":
			return `( ${astToTS( ( ast as Parens ).data[ 0 ] )} )`;

		case "Program":
			return [ ...( ast as Program ) ].map( astToTS ).join( "\n" );

		case "Return":
			if ( ! isVoid )
				return `return ${astToTS( ( ast as Return ).data[ 0 ] )};`;
			else
				return "return;";

		case "Statements":
			return [ ...( ast as Statements ) ].map( astToTS ).join( "\n" ).split( "\n" ).map( v => v ? "\t" + v : v ).join( "\n" );

		case "UnaryOp":
			return `${( ast as UnaryOp ).operator.replace( "not", "!" )} ${astToTS( ( ast as UnaryOp ).expr )}`;

		case "Variable": {

			const decl = ( ast as Variable ).constant ? "const" : "let";
			const name = ( ast as Variable ).name.replace( "this", "_this" );
			const baseType = jassTypeToTypeScriptType( ( ast as Variable ).type );
			const type = ( ast as Variable ).array ? `Array<${baseType}>` : baseType;
			const hasInferableValue = "value" in ( ast as Variable );
			const value = hasInferableValue ?
				" = " + astToTS( ( ast as Variable ).value ) :
				( ast as Variable ).array ?
					" = []" :
					"";
			return `${decl} ${name}${hasInferableValue ? "" : `: ${type}`}${value};`;

		}

	}

	throw new Error( "Unknown AST node " + ast.constructor.name );

};

export const jassToTS = ( jass: string ): string => astToTS( jassToAst( jass ) );
