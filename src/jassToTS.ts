import jassToAst, {
	ArrayRef,
	BinaryOp,
	Call,
	Comment,
	Debug,
	Else,
	ElseIf,
	EmptyLine,
	ExitWhen,
	FourCC,
	FuncRef,
	Globals,
	IfThenElse,
	JASSFunction,
	JASSSet,
	List,
	Loop,
	Name,
	Native,
	Node,
	Param,
	Parens,
	Program,
	Return,
	SingleProp,
	Statements,
	Type,
	UnaryOp,
	Variable,
} from "jass-to-ast";

const jassTypeToTypeScriptType = (type: Name): string =>
	type.replace("real", "number").replace("integer", "number");

let isVoid = false;

const astToTS = (
	ast: Node | List<Node> | SingleProp | string | boolean,
): string => {
	if (ast === undefined || ast === null) return "null";

	if (typeof ast === "number" || typeof ast === "boolean")
		return ast.toString();

	if (ast instanceof ArrayRef) return `${ast.name}[ ${astToTS(ast.prop)} ]`;

	if (ast instanceof BinaryOp) {
		const operator = ast.operator
			.replace("or", "||")
			.replace("and", "&&")
			.replace("==", "===")
			.replace("!=", "!==");
		return `${astToTS(ast.left)} ${operator} ${astToTS(ast.right)}`;
	}

	if (ast instanceof Call)
		return `${ast.name}(${
			ast.args ? `${[...ast.args].map(astToTS).join(", ")}` : ""
		})`;

	if (ast instanceof Comment)
		return ast.includes("\n") ? "/*" + ast + "*/" : "//" + ast;

	if (ast instanceof Else) return `else {\n\n${astToTS(ast.statements)}\n\n}`;

	if (ast instanceof ElseIf)
		return `else if ( ${astToTS(ast.condition)} ) {\n\n${astToTS(
			ast.statements,
		)}\n\n}`;

	if (ast instanceof EmptyLine) return "";

	if (ast instanceof ExitWhen) return `if (${astToTS(ast.data[0])}) break;`;

	if (ast instanceof FourCC) return `FourCC("${ast}")`;

	if (ast instanceof FuncRef) return ast.data;

	if (ast instanceof Globals)
		return [
			ast.comment,
			astToTS(ast.globals)
				.split("\n")
				.map((v) => v.slice(1))
				.join("\n"),
			ast.endComment,
		]
			.filter(Boolean)
			.join("\n");

	if (ast instanceof IfThenElse)
		return `if (${astToTS(ast.condition)}) {\n${astToTS(ast.then)}\n}${
			ast.elses ? " " + ast.elses.map(astToTS).join(" ") : ""
		}`;

	if (ast instanceof JASSFunction) {
		if (ast.returns === undefined) isVoid = true;

		const bodyContent = ast.statements ? astToTS(ast.statements) : "";
		const body = bodyContent ? `\n${bodyContent}\n` : "";
		const r = `const ${ast.name} = (${
			ast.params ? `${[...ast.params].map(astToTS).join(", ")}` : ""
		}): ${jassTypeToTypeScriptType(ast.returns || "void")} => {${body}};`;
		isVoid = false;
		return r;
	}

	if (ast instanceof JASSSet) {
		const name = ast.name.replace("this", "_this");
		const prop = ast.prop !== undefined ? `[ ${astToTS(ast.prop)} ]` : "";
		return `${name}${prop} = ${astToTS(ast.value)};`;
	}

	if (ast instanceof Loop)
		return `while (true) {\n${[...ast.statements]
			.map(astToTS)
			.join("\n")
			.split("\n")
			.map((v) => (v ? "\t" + v : v))
			.join("\n")}\n}`;

	if (ast instanceof Name) return ast.replace("this", "_this");

	if (ast instanceof Native) if (ast instanceof Type) return "";

	if (ast instanceof Param)
		return `${ast.name.replace(
			"this",
			"_this",
		)}: ${jassTypeToTypeScriptType(ast.type)}`;

	if (ast instanceof Parens) return `( ${astToTS(ast.data[0])} )`;

	if (ast instanceof Program) return [...ast].map(astToTS).join("\n");

	if (ast instanceof Return)
		if (!isVoid) return `return ${astToTS(ast.data[0])};`;
		else return "return;";

	if (ast instanceof Statements)
		return [...ast]
			.map(astToTS)
			.join("\n")
			.split("\n")
			.map((v) => (v ? "\t" + v : v))
			.join("\n");

	if (ast instanceof UnaryOp)
		return `${ast.operator.replace("not", "!")} ${astToTS(ast.expr)}`;

	if (ast instanceof Variable) {
		const decl = ast.constant ? "const" : "let";
		const name = ast.name.replace("this", "_this");
		const baseType = jassTypeToTypeScriptType(ast.type);
		const type = ast.array ? `Array<${baseType}>` : baseType;
		const hasInferableValue = "value" in ast;
		const value = hasInferableValue
			? " = " + astToTS(ast.value)
			: ast.array
			? " = []"
			: "";

		return `${decl} ${name}${
			hasInferableValue ? "" : `: ${type}`
		}${value};`;
	}

	if (ast instanceof String || typeof ast === "string") return `"${ast}"`;

	if (ast instanceof Debug) return "";

	throw new Error("Unknown AST node " + ast.constructor.name);
};

export const jassToTS = (jass: string): string => astToTS(jassToAst(jass));
