const fs = require('fs');
const path = require('path');

const brainDir = '/home/ubuntu/.gemini/antigravity-ide/brain';
const recoveryDir = '/home/ubuntu/zero-lab-bots/vivy/scratch/recovery';
if (!fs.existsSync(recoveryDir)) {
    fs.mkdirSync(recoveryDir, { recursive: true });
}

function findTranscripts(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            const logDir = path.join(filePath, '.system_generated', 'logs');
            if (fs.existsSync(logDir)) {
                const transcriptFile = path.join(logDir, 'transcript.jsonl');
                if (fs.existsSync(transcriptFile)) {
                    results.push({
                        convoId: file,
                        file: transcriptFile
                    });
                }
            }
        }
    });
    return results;
}

const transcripts = findTranscripts(brainDir);
console.log(`Scanning ${transcripts.length} conversations...`);

transcripts.forEach(({ convoId, file }) => {
    const lines = fs.readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, index) => {
        if (!line.trim()) return;
        try {
            const obj = JSON.parse(line);
            
            // If it is a VIEW_FILE or contains view_file tool result
            // Check for content field or check if it's SYSTEM/USER/MODEL message containing file content
            if (obj.type === 'VIEW_FILE' && obj.content) {
                // Determine which file it is by looking at path in the same or surrounding lines
                // E.g., check if content contains common function names or is preceded by a tool_call
                let filename = '';
                if (obj.content.includes('initDashboard') || obj.content.includes('switchTab') || obj.content.includes('saveModuleConfig')) {
                    filename = 'dashboard.js';
                } else if (obj.content.includes('checkDevAuth') || obj.content.includes('startRealtimeStats') || obj.content.includes('loadAuditLogs')) {
                    filename = 'developer.js';
                }
                
                if (filename) {
                    const chunkName = `${convoId}_line_${index}_${filename}`;
                    fs.writeFileSync(path.join(recoveryDir, chunkName), obj.content);
                    console.log(`Recovered chunk: ${chunkName} (${obj.content.length} bytes)`);
                }
            }
        } catch (err) {
            // Ignore
        }
    });
});
console.log('Recovery complete!');
