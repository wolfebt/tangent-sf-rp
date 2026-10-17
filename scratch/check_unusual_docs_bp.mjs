import fs from 'fs';
import path from 'path';

const docsDir = 'docs/game rules';

function checkAll(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      checkAll(full);
    } else if (entry.name.endsWith('.md')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (/\bBP\b/.test(line)) {
          // Check if this looks like something other than Build Points
          const isBuildPoint = /build point|character point|\d+\s*BP|BP cost|BP\)|\[BP\]|TOTAL BP|Total BP|BP budget|spend BP|gain BP|starting BP|Starting BP|remaining BP|Tier.*BP|costs.*BP|BP per|per BP|BP\s*chassis|invest.*BP|BP pool|refund BP|refunds BP|BP\s*investment|BP\s*allowance|BP\s*allotment|BP\s*limit|BP\s*cap|BP\s*spent|BP\s*granted|BP\s*base|extra BP|unspent BP|free BP|bonus BP|max BP|base BP|BP\s*worth|BP\s*value|BP\s*discount|BP\s*reduction|BP\s*scale|BP\s*chassis|BP\s*total|BP\s*tally/i.test(line);
          if (!isBuildPoint) {
            console.log(`[CHECK] ${full}:${idx + 1}: ${line.trim()}`);
          }
        }
      });
    }
  }
}

checkAll(docsDir);
