const fs = require('fs');

function analyzeDivBalance(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let divStack = [];
  let openDivs = 0;
  let closeDivs = 0;
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Buscar divs de apertura
    const openMatches = line.match(/<div[^>]*>/g);
    if (openMatches) {
      openMatches.forEach(match => {
        if (!match.includes('/>')) { // No es self-closing
          openDivs++;
          divStack.push({
            line: lineNum,
            content: line.trim(),
            type: 'open'
          });
          console.log(`OPEN DIV ${openDivs} at line ${lineNum}: ${line.trim()}`);
        }
      });
    }
    
    // Buscar divs de cierre
    const closeMatches = line.match(/<\/div>/g);
    if (closeMatches) {
      closeMatches.forEach(() => {
        closeDivs++;
        if (divStack.length > 0) {
          const openDiv = divStack.pop();
          console.log(`CLOSE DIV ${closeDivs} at line ${lineNum} (matches open at line ${openDiv.line}): ${line.trim()}`);
        } else {
          console.log(`ERROR: CLOSE DIV ${closeDivs} at line ${lineNum} WITHOUT MATCHING OPEN: ${line.trim()}`);
        }
      });
    }
  });
  
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total open divs: ${openDivs}`);
  console.log(`Total close divs: ${closeDivs}`);
  console.log(`Balance: ${openDivs - closeDivs}`);
  
  if (divStack.length > 0) {
    console.log(`\n=== UNMATCHED OPEN DIVS ===`);
    divStack.forEach(div => {
      console.log(`Line ${div.line}: ${div.content}`);
    });
  }
}

const filePath = 'src/pages/InstructorAmbientesPage.jsx';
analyzeDivBalance(filePath);