// Terminal front end for the CV.
// The CV text lives in index.html (English) and es/index.html (Spanish), inside <article id="cv">.
// This script only reads it, so the terminal, the plain view, and the PDF always show the same content.
(() => {
    const root = document.documentElement;
    const LANG = root.lang.toLowerCase().startsWith('es') ? 'es' : 'en';
    const OTHER = LANG === 'en' ? 'es' : 'en';
    const output = document.getElementById('output');
    const input = document.getElementById('command-input');
    const PDF_URL = document.querySelector('.title-links .pdf-link').getAttribute('href');
    const OTHER_LANG_URL = document.querySelector('.title-links .lang-link').getAttribute('href');
    const SECTION_ORDER = ['about', 'experience', 'projects', 'skills', 'education', 'certs', 'contact'];

    // ---- UI TEXT PER LANGUAGE ----
    // Each command has one internal key (its English name). The Spanish page shows Spanish
    // labels, and either language's name works when typed on either page.
    const TEXT = {
        en: {
            labels: {},
            desc: {
                about: 'Summary',
                experience: 'Work history',
                projects: 'Projects and writing',
                skills: 'Tech stack and tools',
                education: 'Academic background',
                certs: 'Certifications',
                contact: 'LinkedIn, email, GitHub',
                all: 'Everything above',
                cv: 'Plain, printable page',
                pdf: 'Download the CV as PDF',
                es: 'Ver en español',
                clear: 'Clear the screen',
            },
            commands: 'Commands:',
            helpTitle: 'AVAILABLE COMMANDS',
            helpHint: 'Tab completes, arrow keys browse history.',
            notFound: (n) => `command not found: ${n}. Type 'help' for options.`,
            opening: ['Opening ', 'the PDF', ' in a new tab.'],
            alreadyHere: 'This is already the English version.',
        },
        es: {
            labels: {
                about: 'perfil',
                experience: 'experiencia',
                projects: 'proyectos',
                skills: 'habilidades',
                education: 'educación',
                certs: 'certificaciones',
                contact: 'contacto',
                all: 'todo',
                help: 'ayuda',
                clear: 'limpiar',
            },
            desc: {
                about: 'Resumen',
                experience: 'Experiencia laboral',
                projects: 'Proyectos y publicaciones',
                skills: 'Stack y herramientas',
                education: 'Formación académica',
                certs: 'Certificaciones',
                contact: 'LinkedIn, correo, GitHub',
                all: 'Todo lo anterior',
                cv: 'Página simple e imprimible',
                pdf: 'Descargar el CV en PDF',
                en: 'View in English',
                clear: 'Limpiar la pantalla',
            },
            commands: 'Comandos:',
            helpTitle: 'COMANDOS DISPONIBLES',
            helpHint: 'Tab autocompleta y las flechas recorren el historial.',
            notFound: (n) => `comando no encontrado: ${n}. Escribe 'ayuda' para ver las opciones.`,
            opening: ['Abriendo ', 'el PDF', ' en una pestaña nueva.'],
            alreadyHere: 'Ya estás en la versión en español.',
        },
    };
    const t = TEXT[LANG];
    const label = (key) => t.labels[key] || key;
    // lowercase, trimmed, accents removed: "Educación" and "educacion" both match
    const norm = (s) => s.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // ---- CONTENT: read each <section data-cmd> from the page ----
    const sections = new Map();
    document.querySelectorAll('#cv section[data-cmd]').forEach((s) => sections.set(s.dataset.cmd, s));

    // ---- COMMANDS ----
    // Maps (not plain objects) so names like "constructor" are not treated as commands.
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
        return [el('p', {}, [t.opening[0], link(PDF_URL, t.opening[1]), t.opening[2]])];
    });
    const switchLang = (target) => () => {
        if (target === LANG) return [el('p', {}, [t.alreadyHere])];
        location.href = OTHER_LANG_URL;
        return [];
    };
    commands.set('en', switchLang('en'));
    commands.set('es', switchLang('es'));
    commands.set('clear', () => null);

    // Every typed name that runs a command: internal keys, both languages' labels, aliases.
    const NAMES = new Map();
    commands.forEach((_, key) => NAMES.set(key, key));
    Object.values(TEXT).forEach((lang) =>
        Object.entries(lang.labels).forEach(([key, l]) => NAMES.set(norm(l), key)));
    [['whoami', 'about'], ['ls', 'help'], ['cls', 'clear'],
     ['espanol', 'es'], ['spanish', 'es'], ['english', 'en'], ['ingles', 'en']]
        .forEach(([alias, key]) => NAMES.set(alias, key));

    // Commands offered on this page (help list and Tab completion)
    const HELP_ORDER = [...SECTION_ORDER, 'all', 'cv', 'pdf', OTHER, 'clear'];
    const OFFERED = [...HELP_ORDER, 'help'];

    function run(raw) {
        const typed = raw.trim().toLowerCase();
        const key = NAMES.get(norm(raw));

        if (key === 'clear') {
            output.replaceChildren();
            return;
        }

        const block = el('div', { class: 'block' }, [echoLine(raw)]);
        if (typed === '') {
            // empty Enter: just echo the prompt, like a real shell
        } else if (key) {
            block.append(...commands.get(key)());
        } else {
            block.append(el('p', { class: 'error' }, [t.notFound(typed)]));
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

    function cmdButton(key) {
        return el('button', { type: 'button', class: 'cmd', 'data-cmd': key }, [label(key)]);
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
        const rows = HELP_ORDER.map((key) =>
            el('li', {}, [cmdButton(key), el('span', { class: 'muted' }, [t.desc[key]])]));
        return el('section', {}, [
            el('h2', { class: 'section-title' }, [t.helpTitle]),
            el('ul', { class: 'help-list' }, rows),
            el('p', { class: 'date' }, [t.helpHint]),
        ]);
    }

    function commandBar() {
        const keys = ['experience', 'projects', 'skills', 'education', 'certs', 'contact', 'all', 'cv', 'pdf', 'help'];
        const bar = el('p', { class: 'cmd-bar' }, [el('strong', {}, [t.commands]), ' ']);
        keys.forEach((k, i) => {
            bar.append(cmdButton(k));
            if (i < keys.length - 1) bar.append(' ');
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
            const typed = norm(input.value);
            if (typed === '') return; // let Tab move focus as usual
            e.preventDefault();
            const matches = OFFERED.filter((k) => norm(label(k)).startsWith(typed));
            if (matches.length === 1) {
                input.value = label(matches[0]);
            } else if (matches.length > 1) {
                const list = el('p', { class: 'cmd-bar' });
                matches.forEach((k) => list.append(cmdButton(k), ' '));
                output.append(el('div', { class: 'block' }, [echoLine(input.value), list]));
                output.scrollTop = output.scrollHeight;
            }
        }
    });

    // ---- CLICKS: any element with data-cmd runs that command ----
    output.addEventListener('click', (e) => {
        const target = e.target.closest('[data-cmd]');
        if (!target || !output.contains(target)) return;
        e.preventDefault();
        run(label(target.dataset.cmd));
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
