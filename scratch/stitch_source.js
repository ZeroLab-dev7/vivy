const fs = require('fs');
const path = require('path');

const recoveryDir = '/home/ubuntu/zero-lab-bots/vivy/scratch/recovery';

function stitch(targetFilePattern) {
    const files = fs.readdirSync(recoveryDir).filter(f => f.endsWith(targetFilePattern));
    console.log(`Found ${files.length} chunks for ${targetFilePattern}`);
    
    let lineMap = new Map(); // line_number -> line_content
    
    files.forEach(file => {
        const content = fs.readFileSync(path.join(recoveryDir, file), 'utf8');
        const lines = content.split('\n');
        
        lines.forEach(line => {
            // Match format: "line_number: content" (e.g., "12: let x = 5;")
            const match = line.match(/^(\d+): (.*)$/);
            if (match) {
                const lineNum = parseInt(match[1]);
                const lineContent = match[2];
                // We keep the one with larger length or just any
                lineMap.set(lineNum, lineContent);
            }
        });
    });
    
    if (lineMap.size === 0) {
        console.log(`No lines parsed for ${targetFilePattern}`);
        return;
    }
    
    const maxLine = Math.max(...lineMap.keys());
    console.log(`Max line parsed: ${maxLine}`);
    
    let stitched = [];
    let missing = [];
    for (let i = 1; i <= maxLine; i++) {
        if (lineMap.has(i)) {
            stitched.push(lineMap.get(i));
        } else {
            stitched.push(`// MISSING LINE ${i}`);
            missing.push(i);
        }
    }
    
    console.log(`Missing ${missing.length} lines: ${missing.slice(0, 20).join(', ')}${missing.length > 20 ? '...' : ''}`);
    
    return { stitched: stitched.join('\n'), maxLine, missingCount: missing.length };
}

console.log('Stitching dashboard.js...');
const dashboard = stitch('dashboard.js');
if (dashboard) {
    fs.writeFileSync('/home/ubuntu/zero-lab-bots/vivy/scratch/stitched_dashboard.js', dashboard.stitched);
    console.log(`Stitched dashboard.js written. Missing: ${dashboard.missingCount}`);
}

console.log('\nStitching developer.js...');
const developer = stitch('developer.js');
if (developer) {
    fs.writeFileSync('/home/ubuntu/zero-lab-bots/vivy/scratch/stitched_developer.js', developer.stitched);
    console.log(`Stitched developer.js written. Missing: ${developer.missingCount}`);
}
