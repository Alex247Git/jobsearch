const fs = require('fs');
const path = require('path');

const TARGET_DIR = './src'; // Ρύθμισε αν έχεις τα components αλλού
const navigateRegex = /navigate\s*\(\s*['"`](.*?)['"`]\s*\)/g;
const linkRegex = /<Link[^>]*\s+to\s*=\s*['"`](.*?)['"`]/g;

const routes = new Set();

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    let match;
    while ((match = navigateRegex.exec(content)) !== null) {
        routes.add(match[1]);
    }

    while ((match = linkRegex.exec(content)) !== null) {
        routes.add(match[1]);
    }
}

function scanDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const fullPath = path.join(dirPath, file);

        if (fs.statSync(fullPath).isDirectory()) {
            scanDirectory(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
            scanFile(fullPath);
        }
    }
}

scanDirectory(TARGET_DIR);

console.log('\n📦 Navigation Routes Detected:\n');
[...routes].forEach((route) => console.log('➡️  ' + route));
