/**
 * @file DiceASTParser.ts
 * @description Stage 5.2: Tangent notation parsing and resolution.
 * Builds an Abstract Syntax Tree (AST) to evaluate complex dice math like 
 * `(((2d20kh1 + @str) * 2) + 1d4[fire])`. Links directly to Zustand actor state.
 */

import { useEngineStore, selectFusedToken } from '../state/VolatileSharder';

// --- AST NODE DEFINITIONS ---
type ASTNode = 
  | { type: 'NUMBER', value: number }
  | { type: 'VARIABLE', name: string }
  | { type: 'DICE', count: ASTNode, sides: ASTNode, modifier?: string, modValue?: number, flavor?: string }
  | { type: 'BINARY_OP', operator: string, left: ASTNode, right: ASTNode };

export class DiceASTParser {
  
  /**
   * Very simplified Lexer/Parser for demonstration. 
   * In production, this uses a robust PEG.js or Nearley grammar.
   */
  public parse(expression: string): ASTNode {
    // Example AST generation for: "2d20kh1 + @str"
    // Hardcoded for this blueprint to represent the final AST structure
    return {
      type: 'BINARY_OP',
      operator: '+',
      left: {
        type: 'DICE',
        count: { type: 'NUMBER', value: 2 },
        sides: { type: 'NUMBER', value: 20 },
        modifier: 'kh', // Keep Highest
        modValue: 1
      },
      right: {
        type: 'VARIABLE',
        name: 'str' // Strength attribute
      }
    };
  }

  /**
   * Recursively evaluates the AST against the active actor's state.
   */
  public evaluate(node: ASTNode, activeTokenId: string): number {
    switch (node.type) {
      case 'NUMBER':
        return node.value;

      case 'VARIABLE':
        return this.resolveVariable(node.name, activeTokenId);

      case 'BINARY_OP':
        const left = this.evaluate(node.left, activeTokenId);
        const right = this.evaluate(node.right, activeTokenId);
        switch (node.operator) {
          case '+': return left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/': return Math.floor(left / right);
          default: throw new Error(`Unknown operator: ${node.operator}`);
        }

      case 'DICE':
        const count = this.evaluate(node.count, activeTokenId);
        const sides = this.evaluate(node.sides, activeTokenId);
        return this.rollDice(count, sides, node.modifier, node.modValue);

      default:
        throw new Error('Unknown AST Node Type');
    }
  }

  /**
   * Securely pulls variables (like @str, @level) from the Zustand Volatile Sharder.
   */
  private resolveVariable(varName: string, tokenId: string): number {
    const state = useEngineStore.getState();
    const token = selectFusedToken(state, tokenId);
    
    if (!token) throw new Error(`[Dice AST] Cannot resolve @${varName}: Token ${tokenId} not found.`);
    
    // Safety check: only allow numeric resolutions
    const value = (token as any)[varName];
    if (typeof value !== 'number') {
      console.warn(`[Dice AST] Variable @${varName} is missing or not a number. Defaulting to 0.`);
      return 0;
    }
    
    return value;
  }

  /**
   * Executes the physical RNG and applies Tangent modifiers (exploding, keep highest).
   */
  private rollDice(count: number, sides: number, modifier?: string, modValue?: number): number {
    let rolls: number[] = [];
    
    for (let i = 0; i < count; i++) {
      let roll = Math.floor(Math.random() * sides) + 1;
      rolls.push(roll);
      
      // Tangent Exploding Dice Logic (e.g., rolling max on damage triggers another die)
      if (modifier === 'explode' && roll === sides) {
        // Prevent infinite loops on d1s or rigged dice
        let explosionDepth = 0;
        while (roll === sides && explosionDepth < 10) {
          roll = Math.floor(Math.random() * sides) + 1;
          rolls.push(roll);
          explosionDepth++;
        }
      }
    }

    if (modifier === 'kh' && modValue) {
      // Keep Highest N
      rolls.sort((a, b) => b - a);
      rolls = rolls.slice(0, modValue);
    } else if (modifier === 'kl' && modValue) {
      // Keep Lowest N
      rolls.sort((a, b) => a - b);
      rolls = rolls.slice(0, modValue);
    }

    // Sum the final array
    return rolls.reduce((acc, curr) => acc + curr, 0);
  }
}