// Terminal front end for the CV.
// The CV text lives in index.html (<article id="cv">). This script only reads it,
// so the terminal, the plain view, and the PDF always show the same content.
(() => {
    const root = document.documentElement;
    const output = document.getElementById('output');
    const input = document.getElementById('command-input');
    const PDF_URL = 'assets/Nathan-Cortez-Guevara-CV.pdf';
    const SECTION_ORDER = ['about', 'experience', 'projects', 'skills', 'education', 'certs', 'contact'];

    // ---- CONTENT: read each <section data-cmd> from the page ----
    const sections = new Map();
    document.querySelectorAll('#cv section[data-cmd]').forEach((s) => sections.set(s.dataset.cmd, s));

    // ---- COMMANDS ----
    // A Map (not a plain object) so names like "constructor" are not treated as commands.
    const HELP = [
        ['about', 'Summary'],
        ['experience', 'Work history'],
        ['projects', 'Projects and writing'],
        ['skills', 'Tech stack and tools'],
        ['education', 'Academic background'],
        ['certs', 'Certifications'],
        ['contact', 'LinkedIn, email, GitHub'],
        ['all', 'Everything above'],
        ['cv', 'Plain, printable page'],
        ['pdf', 'Download the CV as PDF'],
        ['clear', 'Clear the screen'],
    ];
    const ALIASES = new Map([['whoami', 'about'], ['ls', 'help'], ['cls', 'clear']]);

    const commands = new Map();
    SECTION_ORDER.forEach((name) => commands.set(name, () => [cloneSection(name)]));
    commands.set('all', () => SECTION_ORDER.map(cloneSection));
    commands.set('help', () => [helpList()]);
    commands.set('cv', () => {
        location.hash = 'cv';
        return [];
    });
    commands.set('pdf', () => {
        window.open(PDF_URL, '_blank', 'noopener');
        return [el('p', {}, ['Opening ', link(PDF_URL, 'the PDF'), ' in a new tab.'])];
    });
    commands.set('clear', () => null);

    const NAMES = [...commands.keys()];

    function run(raw) {
        const name = raw.trim().toLowerCase();
        const cmd = ALIASES.get(name) || name;

        if (cmd === 'clear') {
            output.replaceChildren();
            return;
        }

        const block = el('div', { class: 'block' }, [echoLine(raw)]);
        if (cmd === '') {
            // empty Enter: just echo the prompt, like a real shell
        } else if (commands.has(cmd)) {
            block.append(...commands.get(cmd)());
        } else {
            block.append(el('p', { class: 'error' }, [`command not found: ${name}. Type 'help' for options.`]));
        }
        output.append(block);
        // Show the start of the new output, not the end of it.
        output.scrollTop += block.getBoundingClientRect().top - output.getBoundingClientRect().top - 8;
    }

    // ---- RENDERING HELPERS ----
    function el(tag, attrs = {}, children = []) {
        const node = document.createElement(tag);
        Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
        node.append(...children);
        return node;
    }

    function link(href, text) {
        return el('a', { href, target: '_blank', rel: 'noopener' }, [text]);
    }

    function cmdButton(name) {
        return el('button', { type: 'button', class: 'cmd', 'data-cmd': name }, [name]);
    }

    function echoLine(raw) {
        return el('p', { class: 'echo' }, [
            el('span', { class: 'prompt' }, [el('span', { class: 'prompt-host' }, ['guest@natecor:']), '~$']),
            ' ',
            raw,
        ]);
    }

    function cloneSection(name) {
        const copy = sections.get(name).cloneNode(true);
        copy.removeAttribute('id');
        copy.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
        return copy;
    }

    function helpList() {
        const rows = HELP.map(([name, desc]) => el('li', {}, [cmdButton(name), el('span', { class: 'muted' }, [desc])]));
        return el('section', {}, [
            el('h2', { class: 'section-title' }, ['AVAILABLE COMMANDS']),
            el('ul', { class: 'help-list' }, rows),
            el('p', { class: 'date' }, ['Tab completes, arrow keys browse history.']),
        ]);
    }

    function commandBar() {
        const names = ['experience', 'projects', 'skills', 'education', 'certs', 'contact', 'all', 'cv', 'pdf', 'help'];
        const bar = el('p', { class: 'cmd-bar' }, [el('strong', {}, ['Commands:']), ' ']);
        names.forEach((n, i) => {
            bar.append(cmdButton(n));
            if (i < names.length - 1) bar.append(' ');
        });
        return bar;
    }

    // ---- INPUT: Enter, history, Tab completion ----
    const history = [];
    let historyIndex = 0;

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const raw = input.value;
            if (raw.trim() !== '') history.push(raw);
            historyIndex = history.length;
            input.value = '';
            run(raw);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) input.value = history[--historyIndex];
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < history.length - 1) {
                input.value = history[++historyIndex];
            } else {
                historyIndex = history.length;
                input.value = '';
            }
        } else if (e.key === 'Tab') {
            const typed = input.value.trim().toLowerCase();
            if (typed === '') return; // let Tab move focus as usual
            e.preventDefault();
            const matches = NAMES.filter((n) => n.startsWith(typed));
            if (matches.length === 1) {
                input.value = matches[0];
            } else if (matches.length > 1) {
                const list = el('p', { class: 'cmd-bar' });
                matches.forEach((m) => list.append(cmdButton(m), ' '));
                const block = el('div', { class: 'block' }, [echoLine(input.value), list]);
                output.append(block);
                output.scrollTop = output.scrollHeight;
            }
        }
    });

    // ---- CLICKS: any element with data-cmd runs that command ----
    output.addEventListener('click', (e) => {
        const target = e.target.closest('[data-cmd]');
        if (!target || !output.contains(target)) return;
        e.preventDefault();
        run(target.dataset.cmd);
    });

    // Clicking empty space in the terminal focuses the input (desktop only, so phones
    // do not pop the keyboard every time a command is tapped).
    const finePointer = window.matchMedia('(pointer: fine)');
    document.querySelector('.terminal-window').addEventListener('click', (e) => {
        if (!finePointer.matches) return;
        if (e.target.closest('a, button, input')) return;
        if (String(window.getSelection())) return; // allow copying text
        input.focus({ preventScroll: true });
    });

    // ---- MODES: terminal (no hash) or plain view (#cv or any section anchor) ----
    function applyMode() {
        const hash = location.hash;
        const plain = hash !== '' && hash !== '#';
        root.classList.toggle('plain', plain);
        if (plain) {
            const target = document.getElementById(decodeURIComponent(hash.slice(1)));
            if (target) target.scrollIntoView();
        } else if (finePointer.matches) {
            input.focus({ preventScroll: true });
        }
    }
    window.addEventListener('hashchange', applyMode);

    // ---- START ----
    output.append(el('div', { class: 'block' }, [cloneSection('about'), commandBar()]));
    applyMode();
})();
