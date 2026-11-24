/**
 * @file lintJsxStaticCheck.mjs
 * @description Fast zero-bloat AST static analyzer built on the installed TypeScript compiler API.
 * Catches issues in .jsx/.tsx/.js/.ts files that plain `tsc --noEmit` skips when allowJs is used without checkJs:
 *   1. Syntax / parse errors
 *   2. Duplicate JSX attributes/props on an element
 *   3. Duplicate object literal property keys
 *   4. Duplicate const/let/import bindings in the same lexical block
 *   5. Conditional or loop-nested React Hook calls inside components/custom hooks
 *   6. Disallowed Konva imports (when --no-konva is active)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const HOOK_NAME_RE = /^use[A-Z][A-Za-z0-9]*$/;
const COMPONENT_OR_HOOK_RE = /^(?:[A-Z][A-Za-z0-9]*|use[A-Z][A-Za-z0-9]*)$/;

function getScriptKind(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.tsx') return ts.ScriptKind.TSX;
  if (ext === '.ts' || ext === '.mts' || ext === '.cts') return ts.ScriptKind.TS;
  if (ext === '.jsx') return ts.ScriptKind.JSX;
  return ts.ScriptKind.JSX;
}

function formatLocation(sf, pos) {
  const { line, character } = sf.getLineAndCharacterOfPosition(pos);
  return { line: line + 1, column: character + 1 };
}

function collectBindingNames(nameNode, out = []) {
  if (!nameNode) return out;
  if (ts.isIdentifier(nameNode)) {
    out.push({ name: nameNode.text, node: nameNode });
    return out;
  }
  if (ts.isObjectBindingPattern(nameNode) || ts.isArrayBindingPattern(nameNode)) {
    for (const el of nameNode.elements) {
      if (ts.isBindingElement(el)) {
        collectBindingNames(el.name, out);
      }
    }
  }
  return out;
}

function getPropertyKeyName(propName) {
  if (!propName) return null;
  if (ts.isIdentifier(propName)) return propName.text;
  if (ts.isStringLiteral(propName) || ts.isNoSubstitutionTemplateLiteral(propName)) return propName.text;
  if (ts.isNumericLiteral(propName)) return String(Number(propName.text));
  return null;
}

function inferFunctionName(fnNode) {
  if ((ts.isFunctionDeclaration(fnNode) || ts.isFunctionExpression(fnNode)) && fnNode.name) {
    return fnNode.name.text;
  }
  const parent = fnNode.parent;
  if (!parent) return '';
  if (ts.isVariableDeclaration(parent) && ts.isIdentifier(parent.name)) {
    return parent.name.text;
  }
  if (ts.isPropertyAssignment(parent)) {
    return getPropertyKeyName(parent.name) || '';
  }
  if (ts.isCallExpression(parent) && ts.isVariableDeclaration(parent.parent) && ts.isIdentifier(parent.parent.name)) {
    // e.g. const Foo = React.memo((props) => ...)
    return parent.parent.name.text;
  }
  return '';
}

function checkBlockDuplicateBindings(statements, sf, issues, filePath) {
  const seen = new Map();

  const register = (name, node, kind) => {
    if (!name) return;
    const prev = seen.get(name);
    if (prev) {
      const loc = formatLocation(sf, node.getStart(sf));
      const prevLoc = formatLocation(sf, prev.node.getStart(sf));
      issues.push({
        filePath,
        line: loc.line,
        column: loc.column,
        rule: 'duplicate-binding',
        message: `Identifier '${name}' (${kind}) duplicates earlier ${prev.kind} at line ${prevLoc.line}.`
      });
    } else {
      seen.set(name, { node, kind });
    }
  };

  for (const stmt of statements) {
    if (ts.isImportDeclaration(stmt) && stmt.importClause) {
      if (stmt.importClause.isTypeOnly) continue;
      if (stmt.importClause.name) {
        register(stmt.importClause.name.text, stmt.importClause.name, 'import');
      }
      const nb = stmt.importClause.namedBindings;
      if (nb) {
        if (ts.isNamespaceImport(nb)) {
          register(nb.name.text, nb.name, 'import');
        } else if (ts.isNamedImports(nb)) {
          for (const spec of nb.elements) {
            if (spec.isTypeOnly) continue;
            register(spec.name.text, spec.name, 'import');
          }
        }
      }
    } else if (ts.isVariableStatement(stmt)) {
      const flags = stmt.declarationList.flags;
      const isLexical = Boolean(flags & (ts.NodeFlags.Const | ts.NodeFlags.Let));
      if (!isLexical) continue;
      for (const decl of stmt.declarationList.declarations) {
        const names = collectBindingNames(decl.name);
        for (const item of names) {
          register(item.name, item.node, flags & ts.NodeFlags.Const ? 'const' : 'let');
        }
      }
    } else if (ts.isFunctionDeclaration(stmt) && stmt.name && stmt.body) {
      register(stmt.name.text, stmt.name, 'function');
    }
  }
}

function scanHooksInConditionalOrLoop(node, inConditionalBranch, sf, issues, filePath) {
  if (!node) return;
  if (
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isArrowFunction(node)
  ) {
    return;
  }

  if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
    const fnName = node.expression.text;
    if (HOOK_NAME_RE.test(fnName) && inConditionalBranch) {
      const loc = formatLocation(sf, node.getStart(sf));
      issues.push({
        filePath,
        line: loc.line,
        column: loc.column,
        rule: 'conditional-hook',
        message: `React Hook '${fnName}' is called conditionally or inside a loop branch.`
      });
    }
  }

  if (ts.isIfStatement(node)) {
    scanHooksInConditionalOrLoop(node.expression, inConditionalBranch, sf, issues, filePath);
    scanHooksInConditionalOrLoop(node.thenStatement, true, sf, issues, filePath);
    if (node.elseStatement) {
      scanHooksInConditionalOrLoop(node.elseStatement, true, sf, issues, filePath);
    }
    return;
  }

  if (
    ts.isForStatement(node) ||
    ts.isForInStatement(node) ||
    ts.isForOfStatement(node) ||
    ts.isWhileStatement(node) ||
    ts.isDoStatement(node) ||
    ts.isSwitchStatement(node)
  ) {
    ts.forEachChild(node, (child) => {
      scanHooksInConditionalOrLoop(child, true, sf, issues, filePath);
    });
    return;
  }

  if (ts.isConditionalExpression(node)) {
    scanHooksInConditionalOrLoop(node.condition, inConditionalBranch, sf, issues, filePath);
    scanHooksInConditionalOrLoop(node.whenTrue, true, sf, issues, filePath);
    scanHooksInConditionalOrLoop(node.whenFalse, true, sf, issues, filePath);
    return;
  }

  if (
    ts.isBinaryExpression(node) &&
    (node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
      node.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
      node.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)
  ) {
    scanHooksInConditionalOrLoop(node.left, inConditionalBranch, sf, issues, filePath);
    scanHooksInConditionalOrLoop(node.right, true, sf, issues, filePath);
    return;
  }

  ts.forEachChild(node, (child) => {
    scanHooksInConditionalOrLoop(child, inConditionalBranch, sf, issues, filePath);
  });
}

/**
 * Runs AST static lint checks against a single source file string.
 */
export function lintSourceCode(code, filePath = 'input.jsx', options = {}) {
  const { checkKonva = true } = options;
  const sf = ts.createSourceFile(
    filePath,
    code,
    ts.ScriptTarget.Latest,
    true,
    getScriptKind(filePath)
  );
  const issues = [];

  if (Array.isArray(sf.parseDiagnostics) && sf.parseDiagnostics.length > 0) {
    for (const diag of sf.parseDiagnostics) {
      const loc = formatLocation(sf, diag.start ?? 0);
      issues.push({
        filePath,
        line: loc.line,
        column: loc.column,
        rule: 'syntax-error',
        message: ts.flattenDiagnosticMessageText(diag.messageText, ' ')
      });
    }
  }

  checkBlockDuplicateBindings(sf.statements, sf, issues, filePath);

  const visit = (node) => {
    if (checkKonva && ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const mod = node.moduleSpecifier.text;
      if (mod === 'konva' || mod === 'react-konva' || mod.startsWith('konva/')) {
        const loc = formatLocation(sf, node.getStart(sf));
        issues.push({
          filePath,
          line: loc.line,
          column: loc.column,
          rule: 'no-konva-import',
          message: `Disallowed legacy Konva import '${mod}'. Use PixiJS v8 renderer modules instead.`
        });
      }
    }

    if (ts.isBlock(node)) {
      checkBlockDuplicateBindings(node.statements, sf, issues, filePath);
    }

    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const seenProps = new Map();
      for (const attr of node.attributes.properties) {
        if (!ts.isJsxAttribute(attr)) continue;
        const propName = attr.name.getText(sf);
        const prev = seenProps.get(propName);
        if (prev !== undefined) {
          const loc = formatLocation(sf, attr.getStart(sf));
          const prevLoc = formatLocation(sf, prev);
          issues.push({
            filePath,
            line: loc.line,
            column: loc.column,
            rule: 'duplicate-jsx-prop',
            message: `Duplicate JSX attribute '${propName}' on <${node.tagName.getText(sf)}> (first defined at line ${prevLoc.line}).`
          });
        } else {
          seenProps.set(propName, attr.getStart(sf));
        }
      }
    }

    if (ts.isObjectLiteralExpression(node)) {
      const seenKeys = new Map();
      for (const prop of node.properties) {
        if (ts.isSpreadAssignment(prop)) continue;
        const key = getPropertyKeyName(prop.name);
        if (!key) continue;
        const accessorKind = ts.isGetAccessorDeclaration(prop)
          ? 'get'
          : ts.isSetAccessorDeclaration(prop)
          ? 'set'
          : 'value';
        const existing = seenKeys.get(key);
        if (existing) {
          const isValidGetterSetterPair =
            (existing.kind === 'get' && accessorKind === 'set') ||
            (existing.kind === 'set' && accessorKind === 'get');
          if (!isValidGetterSetterPair) {
            const loc = formatLocation(sf, prop.getStart(sf));
            const prevLoc = formatLocation(sf, existing.pos);
            issues.push({
              filePath,
              line: loc.line,
              column: loc.column,
              rule: 'duplicate-object-key',
              message: `Duplicate object key '${key}' (first defined at line ${prevLoc.line}).`
            });
          } else {
            seenKeys.set(key, { kind: 'both', pos: existing.pos });
          }
        } else {
          seenKeys.set(key, { kind: accessorKind, pos: prop.getStart(sf) });
        }
      }
    }

    if (
      (ts.isFunctionDeclaration(node) || ts.isFunctionExpression(node) || ts.isArrowFunction(node)) &&
      node.body
    ) {
      const fnName = inferFunctionName(node);
      if (COMPONENT_OR_HOOK_RE.test(fnName)) {
        if (ts.isBlock(node.body)) {
          for (const stmt of node.body.statements) {
            scanHooksInConditionalOrLoop(stmt, false, sf, issues, filePath);
          }
        } else {
          scanHooksInConditionalOrLoop(node.body, false, sf, issues, filePath);
        }
      }
    }

    ts.forEachChild(node, visit);
  };

  visit(sf);
  return issues;
}

function collectSourceFiles(dir, out = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectSourceFiles(full, out);
    } else if (/\.(jsx|tsx|js|ts)$/i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

export function runStaticCheck(options = {}) {
  const targetDir = options.targetDir || path.join(projectRoot, 'src');
  const checkKonva = options.checkKonva !== false;
  const files = collectSourceFiles(targetDir);
  const allIssues = [];

  for (const file of files) {
    const code = fs.readFileSync(file, 'utf8');
    const rel = path.relative(projectRoot, file).replace(/\\/g, '/');
    const fileIssues = lintSourceCode(code, rel, { checkKonva });
    allIssues.push(...fileIssues);
  }

  return { filesScanned: files.length, issues: allIssues };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const checkKonva = !process.argv.includes('--allow-konva');
  const startedAt = Date.now();
  const { filesScanned, issues } = runStaticCheck({ checkKonva });
  const elapsedMs = Date.now() - startedAt;

  if (issues.length > 0) {
    for (const issue of issues) {
      console.error(`[${issue.rule}] ${issue.filePath}:${issue.line}:${issue.column} — ${issue.message}`);
    }
    console.error(`\nJSX/TS Static Check FAILED: ${issues.length} issue(s) across ${filesScanned} files (${elapsedMs}ms).`);
    process.exit(1);
  }

  console.log(`JSX/TS Static Check PASSED: 0 issues across ${filesScanned} files (${elapsedMs}ms).`);
}
