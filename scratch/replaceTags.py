import os
import re

directory = '/root/discord/ozul/helper/events'

# Get all logger files
files = [f for f in os.listdir(directory) if f.startswith('logger_') and f.endswith('.js')]

for filename in files:
    filepath = os.path.join(directory, filename)
    with open(filepath, 'r') as f:
        content = f.read()

    # Pattern 1: executor ? `**${executor.tag || executor.username}**` : 'Unknown'
    # Pattern 2: `**${kickExecutor.tag || kickExecutor.username}**`
    # We want to replace the bolded username with a mention ${var} 

    # Handle the inline ternary first
    # Example: value: executor ? `**${executor.tag || executor.username}**` : 'Not Found'
    # Change to: value: executor ? `${executor}` : 'Not Found'
    
    # We look for: `**${VAR.tag || VAR.username}**`
    # And replace with: `${VAR}`
    
    new_content = re.sub(r'`\*\*\$\{([\w.]+)\.tag \|\| [\w.]+\.username\}\*\*`', r'`${\1}`', content)
    
    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filename}")

print("Done.")
