import { readFileSync } from "node:fs";
import ts from "typescript";

// Reads literal data and visible text from legacy page/component files with
// the TypeScript parser. Nothing is executed: only top-level `const`
// declarations whose initialiser is a plain literal (strings, numbers,
// booleans, arrays, objects) are evaluated; anything else is skipped.

export type Literal = string | number | boolean | null | Literal[] | { [key: string]: Literal };

function parse(file: string): ts.SourceFile {
  const kind = /\.(jsx|tsx)$/.test(file) || /\.js$/.test(file) ? ts.ScriptKind.JSX : ts.ScriptKind.TS;
  return ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, kind);
}

const NOT_LITERAL = Symbol("not-literal");

function literal(node: ts.Expression): Literal | typeof NOT_LITERAL {
  if (ts.isParenthesizedExpression(node)) return literal(node.expression);
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.MinusToken && ts.isNumericLiteral(node.operand)) {
    return -Number(node.operand.text);
  }
  if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
  if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
  if (node.kind === ts.SyntaxKind.NullKeyword) return null;
  if (ts.isArrayLiteralExpression(node)) {
    const items: Literal[] = [];
    for (const element of node.elements) {
      const value = literal(element);
      if (value === NOT_LITERAL) return NOT_LITERAL;
      items.push(value);
    }
    return items;
  }
  if (ts.isObjectLiteralExpression(node)) {
    const object: Record<string, Literal> = {};
    for (const property of node.properties) {
      if (!ts.isPropertyAssignment(property)) return NOT_LITERAL;
      const name = ts.isIdentifier(property.name) || ts.isStringLiteral(property.name) ? property.name.text : null;
      if (name === null) return NOT_LITERAL;
      const value = literal(property.initializer);
      if (value === NOT_LITERAL) return NOT_LITERAL;
      object[name] = value;
    }
    return object;
  }
  return NOT_LITERAL;
}

/** Top-level `const name = <literal>` declarations, by name. Commented-out code is never seen. */
export function extractConstants(file: string): Record<string, Literal> {
  const constants: Record<string, Literal> = {};
  for (const statement of parse(file).statements) {
    if (!ts.isVariableStatement(statement) || !(statement.declarationList.flags & ts.NodeFlags.Const)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
      const value = literal(declaration.initializer);
      if (value !== NOT_LITERAL) constants[declaration.name.text] = value;
    }
  }
  return constants;
}

/**
 * Visible JSX text of a file in source order, one entry per element with text
 * (adjacent text and string expressions joined, whitespace collapsed), with the
 * element's tag name. Used to draft the reviewed prose seed, not imported directly.
 */
export function extractJsxText(file: string): Array<{ tag: string; text: string }> {
  const out: Array<{ tag: string; text: string }> = [];
  const visit = (node: ts.Node) => {
    if (ts.isJsxElement(node)) {
      const parts = node.children.flatMap((child) => {
        if (ts.isJsxText(child)) return [child.text];
        if (ts.isJsxExpression(child) && child.expression && ts.isStringLiteral(child.expression)) return [child.expression.text];
        return [];
      });
      const text = parts.join(" ").replace(/\s+/g, " ").trim();
      if (text) out.push({ tag: node.openingElement.tagName.getText(), text });
    }
    ts.forEachChild(node, visit);
  };
  visit(parse(file));
  return out;
}
