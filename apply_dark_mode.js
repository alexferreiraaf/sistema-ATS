const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Update Tailwind Config
html = html.replace(
    'extend: {',
    'darkMode: "class",\n                extend: {'
);

// 2. Add Toggle Button to Header
const toggleBtnHtml = `
        <div class="absolute top-4 right-4 md:top-8 md:right-8">
            <button id="themeToggleBtn" class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none">
                <i class="fas fa-moon" id="themeIcon"></i>
            </button>
        </div>
`;
html = html.replace('<header class="max-w-6xl mx-auto mb-10 text-center">', toggleBtnHtml + '\n    <header class="max-w-6xl mx-auto mb-10 text-center relative">');

// 3. Update CSS for glass-panel and body
html = html.replace('background-color: #F9FAFB;', 'background-color: #F9FAFB;\n            transition: background-color 0.3s;');
html = html.replace('body {', 'body.dark {\n            background-color: #111827;\n            color: #F9FAFB;\n        }\n        body {');

html = html.replace(
    'background: rgba(255, 255, 255, 0.95);',
    'background: rgba(255, 255, 255, 0.95);\n        }\n        body.dark .glass-panel {\n            background: rgba(31, 41, 55, 0.95);\n            border: 1px solid rgba(255, 255, 255, 0.1);'
);

// 4. Update Classes mapping
const classMap = {
    'bg-white': 'bg-white dark:bg-gray-800',
    'bg-gray-50': 'bg-gray-50 dark:bg-gray-900',
    'bg-gray-100': 'bg-gray-100 dark:bg-gray-700',
    'bg-indigo-100': 'bg-indigo-100 dark:bg-indigo-900',
    'bg-orange-50': 'bg-orange-50 dark:bg-orange-900/30',
    'text-gray-900': 'text-gray-900 dark:text-gray-100',
    'text-gray-800': 'text-gray-800 dark:text-gray-200',
    'text-gray-700': 'text-gray-700 dark:text-gray-300',
    'text-gray-500': 'text-gray-500 dark:text-gray-400',
    'border-gray-200': 'border-gray-200 dark:border-gray-700',
    'border-gray-300': 'border-gray-300 dark:border-gray-600',
    'border-orange-100': 'border-orange-100 dark:border-orange-900/50'
};

for (const [oldClass, newClass] of Object.entries(classMap)) {
    // Regex to match the exact class within class="..."
    const regex = new RegExp(`(?<=class="[^"]*\\b)${oldClass}(?=\\b[^"]*")`, 'g');
    html = html.replace(regex, newClass);
}

// Additional fix for the percentage circle in dark mode
html = html.replace('fill: #1F2937;', 'fill: currentColor;');

// 5. Add JS logic at the end of the script
const jsLogic = `
        // Tema Dark/Light
        const themeToggleBtn = document.getElementById('themeToggleBtn');
        const themeIcon = document.getElementById('themeIcon');
        
        // Check local storage or system preference
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.body.classList.add('dark');
            document.documentElement.classList.add('dark');
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        } else {
            document.body.classList.remove('dark');
            document.documentElement.classList.remove('dark');
            themeIcon.classList.replace('fa-sun', 'fa-moon');
        }

        themeToggleBtn.addEventListener('click', () => {
            document.documentElement.classList.toggle('dark');
            const isDark = document.body.classList.toggle('dark');
            
            if (isDark) {
                themeIcon.classList.replace('fa-moon', 'fa-sun');
                localStorage.theme = 'dark';
            } else {
                themeIcon.classList.replace('fa-sun', 'fa-moon');
                localStorage.theme = 'light';
            }
        });
    </script>
</body>`;
html = html.replace('</script>\n</body>', jsLogic);

// Write back
fs.writeFileSync('index.html', html);
console.log('Dark mode classes injected.');
