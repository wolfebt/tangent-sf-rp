import fs from 'fs';

function testReplacement(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let changedCount = 0;
  lines.forEach((line, idx) => {
    let newLine = line;
    newLine = newLine.replace(/Build Points \(BP\)/g, 'Character Points (CP)');
    newLine = newLine.replace(/Build Point \(BP\)/g, 'Character Point (CP)');
    newLine = newLine.replace(/Build Points/g, 'Character Points');
    newLine = newLine.replace(/Build Point/g, 'Character Point');
    newLine = newLine.replace(/TOTAL BP/g, 'TOTAL CP');
    newLine = newLine.replace(/Total BP/g, 'Total CP');
    newLine = newLine.replace(/BP Cost/g, 'CP Cost');
    newLine = newLine.replace(/BP cost/g, 'CP cost');
    newLine = newLine.replace(/BP Tally/g, 'CP Tally');
    newLine = newLine.replace(/BP Reduction/g, 'CP Reduction');
    newLine = newLine.replace(/BP Gain/g, 'CP Gain');
    newLine = newLine.replace(/BP pool/gi, 'CP pool');
    newLine = newLine.replace(/starting BP/gi, 'starting CP');
    newLine = newLine.replace(/(\d+)\s*BP/g, '$1 CP');
    newLine = newLine.replace(/\[(-?\d+)\s*BP\]/g, '[$1 CP]');
    newLine = newLine.replace(/\bBP\b/g, 'CP');

    if (newLine !== line) {
      changedCount++;
      if (changedCount <= 10) {
        console.log(`[Line ${idx + 1}]`);
        console.log(`  OLD: ${line}`);
        console.log(`  NEW: ${newLine}`);
      }
    }
  });

  console.log(`\nTotal lines changed in ${filePath}: ${changedCount} / ${lines.length}`);
}

testReplacement('docs/game rules/architect/99. MODULAR SPECIES MATRIX.md');
