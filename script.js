const output = document.getElementById('output');
const input = document.getElementById('command-input');

// Command history
let commandHistory = [];
let historyIndex = -1;

// ---- CV DATA (EDIT HERE) ----
const data = {
    about: `
    <span class="section-title">WHOAMI</span><br>
    <strong>Name:</strong> Nathan Cortez Guevara<br>
    <strong>Role:</strong> Cybersecurity Solutions Architect<br>
    <strong>Location:</strong> Santiago, Chile<br>
    <strong>Summary:</strong> Providing high-quality cybersecurity solutions for MSOC services, backed by research and Proofs of Concept (PoC).
    Fostering innovation and automation to scale services and streamline internal processes.
    Experienced across SIEM, VM, XDR, DLP, Endpoint, NAC, and SSE platforms.<br>
    <strong>Aptitudes:</strong> Results-oriented, Speed/Efficiency, Autonomy, Ownership, Proactivity.<br>
    <br>Type <span class="highlight">help</span> to see available commands.
    `,
    experience: `
    <span class="section-title">EXPERIENCE</span><br>
    <div class="job-block">
        <strong>Widefense | Cybersecurity Solutions Architect</strong><br>
        <span class="date">Feb 2026 - Present</span><br>
        Providing high-quality cybersecurity solutions for the MSOC service, backed by research and Proofs of Concept (PoC).
        <ul>
            <li>Innovation and automation to scale the service and streamline internal processes.</li>
            <li>Protection of critical assets through early detection and effective threat response.</li>
            <li>Cost and resource optimization through automation and continuous improvement.</li>
            <li>Regulatory compliance and audits, ensuring transparency and trust for clients and regulatory bodies.</li>
            <li>Incorporating technologies that improve service quality and competitiveness.</li>
        </ul>
    </div>
    <div class="job-block">
        <strong>Widefense | Cybersecurity Analyst</strong><br>
        <span class="date">Aug 2024 - Feb 2026</span><br>
        Administration and optimization of security platforms (SIEM, VM, XDR).
        <ul>
            <li><strong>SIEM (LogRhythm):</strong> Use case design, false positive reduction, parser development.</li>
            <li><strong>VM (Qualys/Tenable):</strong> Risk-based prioritization, remediation tracking.</li>
            <li><strong>Endpoints (Trellix):</strong> Policy orchestration and hardening.</li>
            <li><strong>DRP (ZeroFox):</strong> Brand monitoring and takedowns.</li>
        </ul>
    </div>
    <div class="job-block">
        <strong>Widefense | Continuous Management Intern</strong><br>
        <span class="date">May 2024 - Aug 2024</span><br>
        Hands-on experience with LogRhythm and SIEM management.
    </div>
    `,
    skills: `
    <span class="section-title">SKILLS & STACK</span><br>
    <strong>Platforms:</strong> LogRhythm (Admin/Analyst), Trellix ePO (SaaS/On-Prem), Qualys VMDR, Tenable.io/.sc, Forescout, Skyhigh, ZeroFox, Safetica DLP, MISP.<br>
    <strong>Technical:</strong> Linux, Cloud Computing, Python (Data Science basic), JS/HTML/CSS, Networking, Hardware Maintenance.<br>
    <strong>Core Competencies:</strong> Solutions Architecture, Threat Intelligence, Vulnerability Management, Incident Response, Tuning/Correlation, PoC Research.
    `,
    education: `
    <span class="section-title">EDUCATION</span><br>
    <div class="cert-block">
        <strong>Universidad Mayor</strong><br>
        Técnico Universitario en Ciberseguridad (2024 - 2026)
    </div>
    <div class="cert-block">
        <strong>Pontificia Universidad Católica de Chile</strong><br>
        Bachelor's Degree, Interdisciplinary College CS (2023)
    </div>
    `,
    certs: `
    <span class="section-title">CERTIFICATIONS (Selected)</span><br>
    <ul>
        <li><strong>Safetica:</strong> DLP Certified (2025)</li>
        <li><strong>ZeroFox:</strong> Power User, Intelligence, Disruption & Collections (2025)</li>
        <li><strong>Tenable:</strong> MSSP Practitioner, Service Delivery (2024-25)</li>
        <li><strong>Forescout:</strong> Accredited Engineer (2024)</li>
        <li><strong>Trellix:</strong> ePO Certified Architect, SaaS Certificate (2024)</li>
        <li><strong>LogRhythm:</strong> Platform Administrator (LRPA), Analyst, Support Engineer (2024)</li>
        <li><strong>Cisco:</strong> CyberOps Associate, CCNA1, Networking Essentials (2024)</li>
        <li><strong>CompTIA:</strong> A+, ITF+ (2023-2024)</li>
        <li><strong>Qualys:</strong> VMDR, Cloud Agent, Patch Management (2024)</li>
    </ul>
    `,
    contact: `
    <span class="section-title">CONTACT</span><br>
    <strong>Email:</strong> [Request via LinkedIn]<br>
    <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/nathan-c-b2060b253/" target="_blank">Profile</a><br>
    <strong>GitHub:</strong> <a href="https://github.com/natecor" target="_blank">natecor</a>
    `,
    help: `
    <span class="section-title">AVAILABLE COMMANDS</span><br>
    <span class="highlight">about</span>      - Summary and bio<br>
    <span class="highlight">experience</span> - Work history<br>
    <span class="highlight">skills</span>     - Tech stack and tools<br>
    <span class="highlight">education</span>  - Academic background<br>
    <span class="highlight">certs</span>      - Certifications list<br>
    <span class="highlight">contact</span>    - Socials and email<br>
    <span class="highlight">all</span>        - Display everything<br>
    <span class="highlight">clear</span>      - Clear terminal<br>
    `
};

// ---- INITIALIZATION ----
window.onload = () => {
    printLine('Initializing Secure Connection...');
    output.innerHTML += data.about;
    scrollToBottom();
};

// ---- INPUT HANDLING ----
input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const raw = input.value;
        const cmd = raw.toLowerCase().trim();

        if (cmd !== '') {
            commandHistory.push(raw);
            historyIndex = commandHistory.length;
        }

        handleCommand(cmd, raw);
        input.value = '';
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (historyIndex > 0) {
            historyIndex--;
            input.value = commandHistory[historyIndex];
        }
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (historyIndex < commandHistory.length - 1) {
            historyIndex++;
            input.value = commandHistory[historyIndex];
        } else {
            historyIndex = commandHistory.length;
            input.value = '';
        }
    }
});

// ---- COMMAND LOGIC ----
function handleCommand(cmd, rawInput) {
    // Echo command
    output.innerHTML += `<div><span class="prompt">guest@natecor:~$</span> ${escapeHtml(
        rawInput
    )}</div>`;

    if (cmd === 'clear') {
        output.innerHTML = '';
        return;
    }

    if (cmd === 'all') {
        ['about', 'experience', 'skills', 'education', 'certs', 'contact'].forEach(
            (key) => {
                output.innerHTML += data[key];
            }
        );
        scrollToBottom();
        return;
    }

    if (data[cmd]) {
        output.innerHTML += data[cmd];
    } else if (cmd !== '') {
        output.innerHTML += `<div style="color:#ff5f56;">Command not found: ${escapeHtml(
            cmd
        )}. Type 'help' for options.</div>`;
    }

    scrollToBottom();
}

// ---- UTILS ----
function printLine(text) {
    output.innerHTML += `<div>${escapeHtml(text)}</div>`;
}

function scrollToBottom() {
    output.scrollTop = output.scrollHeight;
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (ch) => {
        return {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[ch];
    });
}

// ---- UX: click anywhere in terminal to focus input ----
document.querySelector('.terminal-window').addEventListener('click', () => {
    input.focus();
});
