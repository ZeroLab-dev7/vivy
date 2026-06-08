const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../events');

const files = fs.readdirSync(dir).filter(f => f.startsWith('logger_') && f.endsWith('.js'));

files.forEach(file => {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Replace executor ? `**${executor.tag || executor.username}**` : 'Unknown'
    content = content.replace(/executor \? `\*\*\\\$\{(?:executor\.tag \|\| executor\.username)\}\*\*` : 'Unknown'/g, "executor ? `<@${executor.id}>` : 'Unknown'");
    
    // Replace `**${executor.tag || executor.username}**`
    // (for cases where executor is guaranteed like kickExecutor)
    content = content.replace(/`\*\*\\\$\{\w+\.tag \|\| \w+\.username\}\*\*`/g, function(match) {
        const varName = match.match(/\\\$\{(\w+)\.tag/)[1];
        return "`<@${" + varName + ".id}>`";
    });

    // Replace executor ? `**${executor.tag || executor.username}**` : 'Self'
    content = content.replace(/executor \? `\*\*\\\$\{(?:executor\.tag \|\| executor\.username)\}\*\*` : 'Self'/g, "executor ? `<@${executor.id}>` : 'Self'");

    fs.writeFileSync(fullPath, content);
});
console.log('Replaced tags in logs');
