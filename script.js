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
    <strong>Summary:</strong> Solutions architect for managed security operations. I design the detection layer end to end: use cases, correlation, automation, and the platforms that run them. Current focus: putting AI agents into the SOC's operational loop, with PoC-backed decisions before anything reaches production.<br>
    <strong>Domain:</strong> SIEM · SOAR · XDR · VM · NAC · SSE · DLP · CTI<br>
    <strong>Aptitudes:</strong> Results-oriented, Speed/Efficiency, Autonomy, Ownership, Proactivity.<br>
    <br>Type <span class="highlight">help</span> to see available commands.
    `,
    experience: `
    <span class="section-title">EXPERIENCE</span><br>
    <div class="job-block">
        <strong>Widefense | Cybersecurity Solutions Architect</strong><br>
        <span class="date">Feb 2026 - Present</span><br>
        Technical lead for MSOC service architecture: detection engineering, automation, PoC research, and platform lifecycle across the SIEM/SOAR estate.
        <ul>
            <li><strong>Detection engineering:</strong> translated 560 LogRhythm AIE rules into a structured use case matrix with MITRE ATT&CK mapping and CIS Controls alignment, enabling cross-platform comparison (LogRhythm, Sentinel, Splunk, QRadar, Wazuh).</li>
            <li><strong>Agentic AI in the SOC:</strong> I manage a work-sanctioned AI agent project inside the MSOC: a customized SOC agent deployed into the service's operational loop (alert triage, case enrichment, IR support), plus a dedicated architecture workspace with detection-engineering records, automation specs, and runbooks as procedural memory.</li>
            <li><strong>Cloud security:</strong> Microsoft Sentinel and Defender for Cloud administration: analytics rules, automation playbooks, advanced hunting (KQL), incident resolution, IOC support.</li>
            <li><strong>Automation:</strong> SOAR playbook design and implementation to scale the service and streamline internal processes.</li>
            <li>Cost optimization and audit/compliance documentation for clients and regulators.</li>
        </ul>
    </div>
    <div class="job-block">
        <strong>Widefense | Cybersecurity Analyst</strong><br>
        <span class="date">Aug 2024 - Mar 2026</span><br>
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
    <strong>SIEM/SOAR:</strong> LogRhythm (Admin/Analyst), Microsoft Sentinel, Wazuh (cloud + on-prem), Shuffle SOAR, TheHive.<br>
    <strong>Platforms:</strong> Trellix ePO (SaaS/On-Prem), Qualys VMDR, Tenable.io/.sc, Security Onion, Forescout (NAC), Skyhigh (SSE), ZeroFox (DRP), Safetica DLP, MISP, eThalamus.<br>
    <strong>Technical:</strong> Linux, Cloud (AWS/Azure), Python (API integrations, automation, data analysis), KQL, JS/HTML/CSS, Networking.<br>
    <strong>Core Competencies:</strong> Solutions Architecture, Detection Engineering, Threat Intelligence, Vulnerability Management, Incident Response, MITRE ATT&CK, CIS Controls, PoC Research.
    `,
    projects: `
    <span class="section-title">PROJECTS</span><br>
    <div class="job-block">
        <strong>Hermes Agent: Autonomous AI Assistant Platform</strong> <span class="date">(May 2026 - Present)</span><br>
        A persistent, self-hosted agentic AI assistant running 24/7 on Linux, built and configured from open-source components. Fully owned, funded, researched, and deployed by me on personal infrastructure. Distinct from the work-sanctioned SOC agent I manage at Widefense: same architectural patterns applied in two very different settings, one agent inside a corporate SOC's operational loop, this one running my own workflows.
        <ul>
            <li>Orchestrates parallel subagent workflows for research, code review, and reconnaissance tasks.</li>
            <li>Automates browser interaction via Chrome DevTools Protocol (CDP) for OSINT and passive reconnaissance.</li>
            <li>Long-term semantic memory across sessions; scheduled cron jobs for automated threat-intel briefings and alerting.</li>
            <li>Integrates with external APIs: Microsoft Graph, GitHub, and security tooling.</li>
            <li>Proven SOC API orchestration: case creation, workflow automation, and log analysis across Wazuh, Shuffle, TheHive, and MISP.</li>
            <li>Self-hosted on my own infrastructure: this website's contact channel is handled by the agent itself (see <span class="highlight">contact</span>).</li>
        </ul>
    </div>
    <div class="job-block">
        <strong>conteo2027: FEUC Live Vote Counting</strong> <span class="date">(Feb 2026 - Present)</span><br>
        Real-time vote count visualization for the PUC student federation (FEUC) elections, in collaboration with the student journalism body El Puclítico. Complete modernization of a static dashboard originally built for 2017.<br>
        <a href="https://github.com/NateCor/conteo2027" target="_blank">github.com/NateCor/conteo2027</a>
    </div>
    <div class="job-block">
        <strong>LogRhythm AIE Alarm Monitor</strong> <span class="date">(2026)</span><br>
        Python CLI that pulls AI Engine alarms from the LogRhythm API and filters by Risk-Based Priority. Paginated, with config via JSON/env/CLI and JSON/CSV exports.<br>
        <a href="https://github.com/NateCor/logrhythm-aie-alarm-monitor" target="_blank">github.com/NateCor/logrhythm-aie-alarm-monitor</a>
    </div>
    <div class="job-block">
        <strong>LogRhythm Agent Heartbeat Monitor</strong> <span class="date">(2026)</span><br>
        Daemon that polls the LogRhythm Admin API to detect stale System Monitor agent heartbeats, with JSON-lines logging and daily summaries.<br>
        <a href="https://github.com/NateCor/logrhythm-system-monitor-agent-heartbeat" target="_blank">github.com/NateCor/logrhythm-system-monitor-agent-heartbeat</a>
    </div>
    <div class="job-block">
        <strong>Full-OSS Cybersecurity Ecosystem Lab (OSSSOC)</strong> <span class="date">(2026 - Present)</span><br>
        First minimum viable product of a broader open-source SOC ecosystem I designed: Zeek network detection (DNS/HTTP/conn) plus Sysmon and Windows Security telemetry feed Wazuh (SIEM), which routes alerts through Shuffle (SOAR) into TheHive (incident response), with MISP for threat intelligence. Fully automated alert-to-case pipeline, orchestrated end to end via API.<br>
        <span class="date">Planned expansion: IT inventory, vulnerability management, and red teaming / security validation components.</span>
    </div>
    <div class="job-block">
        <strong>Writing</strong><br>
        "Gestión de vulnerabilidades: priorizar importa más que solo detectar" (Vulnerability Management: prioritizing matters more than just detecting) - Widefense blog, May 2026.<br>
        <a href="https://widefense.com/blog/gestion-de-vulnerabilidades-priorizar-importa-mas-que-solo-detectar" target="_blank">widefense.com/blog</a>
    </div>
    `,
    education: `
    <span class="section-title">EDUCATION</span><br>
    <div class="cert-block">
        <strong>Universidad Mayor</strong><br>
        Técnico Universitario en Ciberseguridad (2024 - 2026) - Graduated 2026
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
        <li><strong>Cisco:</strong> CyberOps Associate, CCNA1, Networking Essentials, Intro to IoT (2024)</li>
        <li><strong>CompTIA:</strong> A+, ITF+ (2023-2024)</li>
        <li><strong>Qualys:</strong> VMDR, Cloud Agent, Patch Management (2024)</li>
        <li><strong>Red Internacional de Ciberseguridad:</strong> Curso Universitario en Ciberseguridad - CUC 2024, 290 hrs (2025)</li>
    </ul>
    `,
    contact: `
    <span class="section-title">CONTACT</span><br>
    <strong>Email:</strong> <a href="mailto:nc-hermes-assistant@agentmail.to" target="_blank">nc-hermes-assistant@agentmail.to</a><br>
    <span class="date">This inbox is handled by Hermes, my autonomous AI assistant, running 24/7 on self-hosted infrastructure. Write to it and the agent itself reads, triages, and answers your message. Replies may be agent-drafted and reviewed by me before sending.</span><br><br>
    <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/nathan-c-b2060b253/" target="_blank">Profile</a><br>
    <strong>GitHub:</strong> <a href="https://github.com/natecor" target="_blank">natecor</a>
    `,
    help: `
    <span class="section-title">AVAILABLE COMMANDS</span><br>
    <span class="highlight">about</span>      - Summary and bio<br>
    <span class="highlight">experience</span> - Work history<br>
    <span class="highlight">projects</span>   - Portfolio and publications<br>
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
        ['about', 'experience', 'projects', 'skills', 'education', 'certs', 'contact'].forEach(
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