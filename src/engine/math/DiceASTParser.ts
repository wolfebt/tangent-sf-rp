/**
 * @file DiceASTParser.ts
 * @description Stage 5.2 / 6.2: Tangent dice notation parsing and AST evaluation.
 * Builds an Abstract Syntax Tree (AST) to evaluate complex dice math like 
 * `2d20kh1 + @str`, `1d10! + 4`, `(3d6 + 2) * 2`.
 * Links directly to Zustand volatile sharder actor state.
 */

import { useEngineStore, selectFusedToken } from '../state/VolatileSharder.ts';

export type ASTNode = 
  | { type: 'NUMBER'; value: number }
  | { type: 'VARIABLE'; name: string }
  | { type: 'DICE'; count: ASTNode; sides: ASTNode; modifier?: string; modValue?: number; flavor?: string }
  | { type: 'BINARY_OP'; operator: string; left: ASTNode; right: ASTNode };

export class DiceASTParser {
  /**
   * Evaluates an expression string or AST node directly.
   */
  public evaluateExpression(expr: string, activeTokenId?: string): { total: number; breakdown: string } {
    const ast = this.parse(expr);
    const total = this.evaluate(ast, activeTokenId);
    return {
      total,
      breakdown: `${expr} => ${total}`
    };
  }

  /**
   * Parses standard Tangent dice notation into an AST.
   */
  public parse(expression: string): ASTNode {
    const clean = expression.trim();

    // Check for binary operations (+, -, *, /) outside parentheses
    let parenDepth = 0;
    for (let i = clean.length - 1; i >= 0; i--) {
      const char = clean[i];
      if (char === ')') parenDepth++;
      else if (char === '(') parenDepth--;
      else if (parenDepth === 0 && (char === '+' || char === '-')) {
        return {
          type: 'BINARY_OP',
          operator: char,
          left: this.parse(clean.substring(0, i)),
          right: this.parse(clean.substring(i + 1))
        };
      }
    }

    for (let i = clean.length - 1; i >= 0; i--) {
      const char = clean[i];
      if (char === ')') parenDepth++;
      else if (char === '(') parenDepth--;
      else if (parenDepth === 0 && (char === '*' || char === '/')) {
        return {
          type: 'BINARY_OP',
          operator: char,
          left: this.parse(clean.substring(0, i)),
          right: this.parse(clean.substring(i + 1))
        };
      }
    }

    // Strip outer parentheses
    if (clean.startsWith('(') && clean.endsWith(')')) {
      return this.parse(clean.substring(1, clean.length - 1));
    }

    // Check for variable (@str, @armor_dr)
    if (clean.startsWith('@')) {
      return {
        type: 'VARIABLE',
        name: clean.substring(1).trim()
      };
    }

    // Check for Dice notation: e.g. "2d20kh1", "1d10!", "3d6"
    const diceMatch = clean.match(/^(\d*)d(\d+)(kh\d+|kl\d+|!)?$/i);
    if (diceMatch) {
      const countNum = diceMatch[1] ? parseInt(diceMatch[1], 10) : 1;
      const sidesNum = parseInt(diceMatch[2], 10);
      let modifier: string | undefined;
      let modValue: number | undefined;

      if (diceMatch[3]) {
        const modStr = diceMatch[3].toLowerCase();
        if (modStr === '!') {
          modifier = 'explode';
        } else if (modStr.startsWith('kh')) {
          modifier = 'kh';
          modValue = parseInt(modStr.substring(2), 10);
        } else if (modStr.startsWith('kl')) {
          modifier = 'kl';
          modValue = parseInt(modStr.substring(2), 10);
        }
      }

      return {
        type: 'DICE',
        count: { type: 'NUMBER', value: countNum },
        sides: { type: 'NUMBER', value: sidesNum },
        modifier,
        modValue
      };
    }

    // Check for raw number
    const num = parseFloat(clean);
    if (!isNaN(num)) {
      return { type: 'NUMBER', value: num };
    }

    // Fallback: 0
    return { type: 'NUMBER', value: 0 };
  }

  /**
   * Recursively evaluates the AST.
   */
  public evaluate(node: ASTNode, activeTokenId?: string): number {
    switch (node.type) {
      case 'NUMBER':
        return node.value;

      case 'VARIABLE':
        return this.resolveVariable(node.name, activeTokenId);

      case 'BINARY_OP': {
        const left = this.evaluate(node.left, activeTokenId);
        const right = this.evaluate(node.right, activeTokenId);
        switch (node.operator) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/': return right !== 0 ? Math.floor(left / right) : 0;
          default: throw new Error(`Unknown operator: ${node.operator}`);
        }
      }

      case 'DICE': {
        const count = this.evaluate(node.count, activeTokenId);
        const sides = this.evaluate(node.sides, activeTokenId);
        return this.rollDice(count, sides, node.modifier, node.modValue);
      }

      default:
        return 0;
    }
  }

  private resolveVariable(varName: string, tokenId?: string): number {
    if (!tokenId) return 0;
    
    const state = useEngineStore.getState();
    const token = selectFusedToken(state, tokenId);
    
    if (!token) return 0;
    
    const value = (token as any)[varName];
    if (typeof value === 'number') {
      return value;
    }
    
    return 0;
  }

  private rollDice(count: number, sides: number, modifier?: string, modValue?: number): number {
    if (count <= 0 || sides <= 0) return 0;
    let rolls: number[] = [];
    
    for (let i = 0; i < count; i++) {
      let roll = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll);
      
      // Exploding dice
      if (modifier === 'explode' && roll === sides) {
        let explosionDepth = 0;
        while (roll === sides && explosionDepth < 10) {
          roll = Math.floor(Math.random() * sides) + 1;
          rolls.push(roll);
          explosionDepth++;
        }
      }
    }

    if (modifier === 'kh' && modValue) {
      rolls.sort((a, b) => b - a);
      rolls = rolls.slice(0, modValue);
    } else if (modifier === 'kl' && modValue) {
      rolls.sort((a, b) => a - b);
      rolls = rolls.slice(0, modValue);
    }

    return rolls.reduce((acc, curr) => acc + curr, 0);
  }
}
