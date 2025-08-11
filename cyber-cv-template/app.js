'use strict';
(function(){
  const els = {
    year: document.getElementById('year'),
    footerName: document.getElementById('footerName'),
    themeToggle: document.getElementById('themeToggle'),
    printBtn: document.getElementById('printBtn'),
    projectSearch: document.getElementById('projectSearch'),
    projectTags: document.getElementById('projectTags'),
    projectsContent: document.getElementById('projectsContent'),
    profileContent: document.getElementById('profileContent'),
    skillsContent: document.getElementById('skillsContent'),
    experienceContent: document.getElementById('experienceContent'),
    certsContent: document.getElementById('certsContent'),
    educationContent: document.getElementById('educationContent'),
    talksContent: document.getElementById('talksContent'),
    contactMail: document.getElementById('contactMail'),
    contactPGP: document.getElementById('contactPGP'),
    contactLinkedIn: document.getElementById('contactLinkedIn'),
    contactGitHub: document.getElementById('contactGitHub'),
    siteTitle: document.getElementById('site-title'),
  };

  const state = { data: null, tagFilter: new Set(), search: '' };
  const safeURL = (u) => {
    try { const url = new URL(u, location.origin); const ok = ['http:', 'https:', 'mailto:'].includes(url.protocol); return ok ? url.href : '#'; } catch { return '#'; }
  };

  function setTheme(mode){
    // mode: 'light'|'dark'|'auto'
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem('theme', mode);
    els.themeToggle.setAttribute('aria-pressed', mode !== 'auto');
  }

  function toggleTheme(){
    const cur = document.documentElement.getAttribute('data-theme') || 'auto';
    setTheme(cur === 'dark' ? 'light' : cur === 'light' ? 'auto' : 'dark');
  }

  function renderProfile(p){
    els.siteTitle.textContent = p.name || 'Your Name';
    els.footerName.textContent = p.name || 'Your Name';
    document.title = (p.name ? p.name + ' — ' : '') + 'Interactive Cyber CV';

    const frag = document.createDocumentFragment();
    const title = document.createElement('p'); title.innerHTML = `<strong>${escapeHtml(p.title || '')}</strong>`;
    const summary = document.createElement('p'); summary.textContent = p.summary || '';
    const meta = document.createElement('p'); meta.innerHTML = [p.location, p.email, p.website].filter(Boolean).map(x => `<span>${escapeHtml(x)}</span>`).join(' · ');
    frag.append(title, summary, meta);
    els.profileContent.innerHTML = '';
    els.profileContent.appendChild(frag);

    // contact links
    if(p.email) els.contactMail.href = `mailto:${p.email}`;
    if(p.pgp) { els.contactPGP.href = safeURL(p.pgp); els.contactPGP.style.display='inline-block'; } else { els.contactPGP.style.display='none'; }
    if(p.links?.linkedin) { els.contactLinkedIn.href = safeURL(p.links.linkedin); } else { els.contactLinkedIn.style.display='none'; }
    if(p.links?.github) { els.contactGitHub.href = safeURL(p.links.github); } else { els.contactGitHub.style.display='none'; }
  }

  function renderSkills(sk){
    els.skillsContent.innerHTML = '';
    const frag = document.createDocumentFragment();
    (sk?.categories || []).forEach(cat => {
      const wrap = document.createElement('div');
      const h = document.createElement('h3'); h.textContent = cat.name; h.style.marginBottom = '.3rem';
      const ul = document.createElement('ul'); ul.className = 'list';
      (cat.items || []).forEach(item => { const li = document.createElement('li'); li.textContent = item; ul.appendChild(li); });
      wrap.append(h, ul); frag.appendChild(wrap);
    });
    els.skillsContent.appendChild(frag);
  }

  function renderExperience(exp){
    els.experienceContent.innerHTML = '';
    const frag = document.createDocumentFragment();
    (exp||[]).forEach(e => {
      const wrap = document.createElement('article');
      const h = document.createElement('h3');
      const tspan = document.createElement('span'); tspan.textContent = `${e.role || ''} @ ${e.org || ''}`;
      const when = document.createElement('small'); when.textContent = ` ${e.start || ''} – ${e.end || 'Present'}`;
      h.append(tspan, document.createTextNode(' '), when);
      const p = document.createElement('p'); p.textContent = e.summary || '';
      const ul = document.createElement('ul'); ul.className='list';
      (e.highlights||[]).forEach(hh => { const li = document.createElement('li'); li.textContent = hh; ul.appendChild(li); });
      wrap.append(h,p,ul); frag.appendChild(wrap);
    });
    els.experienceContent.appendChild(frag);
  }

  function renderCerts(certs){
    els.certsContent.innerHTML = '';
    const frag = document.createDocumentFragment();
    (certs||[]).forEach(c => { const li = document.createElement('li'); li.textContent = `${c.name} (${c.issuer}${c.year? ', ' + c.year: ''})`; frag.appendChild(li); });
    els.certsContent.appendChild(frag);
  }

  function renderEducation(ed){
    els.educationContent.innerHTML = '';
    const frag = document.createDocumentFragment();
    (ed||[]).forEach(e => { const li = document.createElement('li'); li.textContent = `${e.degree} — ${e.school} (${e.year})`; frag.appendChild(li); });
    els.educationContent.appendChild(frag);
  }

  function renderTalks(t){
    els.talksContent.innerHTML='';
    const frag = document.createDocumentFragment();
    (t||[]).forEach(x => { const li = document.createElement('li');
      const a = document.createElement('a'); a.href = safeURL(x.url||'#'); a.textContent = x.title; a.target = '_blank'; a.rel = 'noopener';
      const s = document.createElement('small'); s.textContent = ` — ${x.event||''} ${x.year||''}`;
      li.append(a, s); frag.appendChild(li);
    });
    els.talksContent.appendChild(frag);
  }

  function uniqueTags(projects){
    const s = new Set(); (projects||[]).forEach(p => (p.tags||[]).forEach(t => s.add(t))); return [...s].sort();
  }

  function renderProjectTags(projects){
    els.projectTags.innerHTML='';
    const tags = uniqueTags(projects);
    const frag = document.createDocumentFragment();
    tags.forEach(tag => { const b = document.createElement('button'); b.className='tag'; b.textContent = tag; b.type='button'; b.setAttribute('aria-pressed','false');
      b.addEventListener('click', () => { if(state.tagFilter.has(tag)) state.tagFilter.delete(tag); else state.tagFilter.add(tag); b.classList.toggle('active'); b.setAttribute('aria-pressed', b.classList.contains('active') ? 'true' : 'false'); renderProjects(state.data.projects); });
      frag.appendChild(b);
    });
    els.projectTags.appendChild(frag);
  }

  function renderProjects(projects){
    els.projectsContent.innerHTML='';
    const search = state.search.toLowerCase();
    const filtered = (projects||[]).filter(p => {
      const matchesText = !search || [p.title,p.description,(p.tags||[]).join(' ')].filter(Boolean).join(' ').toLowerCase().includes(search);
      const matchesTags = state.tagFilter.size === 0 || (p.tags||[]).some(t => state.tagFilter.has(t));
      return matchesText && matchesTags;
    });
    const frag = document.createDocumentFragment();
    filtered.forEach(p => { frag.appendChild(projectCard(p)); });
    els.projectsContent.appendChild(frag);
  }

  function projectCard(p){
    const wrap = document.createElement('article'); wrap.className='project';
    const h = document.createElement('h3'); h.textContent = p.title;
    const d = document.createElement('p'); d.textContent = p.description || '';
    const meta = document.createElement('small'); meta.textContent = [p.role,p.year].filter(Boolean).join(' · ');
    const linkWrap = document.createElement('p');
    if(p.url){ const a = document.createElement('a'); a.href = safeURL(p.url); a.target='_blank'; a.rel='noopener'; a.textContent='View'; linkWrap.appendChild(a); }
    if(p.repo){ const a2 = document.createElement('a'); a2.href = safeURL(p.repo); a2.target='_blank'; a2.rel='noopener'; a2.style.marginLeft='.6rem'; a2.textContent='Code'; linkWrap.appendChild(a2); }
    const tags = document.createElement('div'); tags.className='tags';
    (p.tags||[]).forEach(t => { const span = document.createElement('span'); span.className='tag'; span.textContent=t; tags.appendChild(span); });
    wrap.append(h, d, meta, linkWrap, tags); return wrap;
  }

  function escapeHtml(str){ return (str||'').replace(/[&<>\"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;','\'':'&#39;'}[m])); }

  async function init(){
    els.year.textContent = new Date().getFullYear();
    const pref = localStorage.getItem('theme'); if(pref) setTheme(pref);

    els.themeToggle.addEventListener('click', toggleTheme);
    els.printBtn.addEventListener('click', () => window.print());
    els.projectSearch.addEventListener('input', (e)=>{ state.search = e.target.value || ''; renderProjects(state.data.projects); });

    try{
      const res = await fetch('data/resume.json', {cache: 'no-store'});
      if(!res.ok) throw new Error('Failed to load resume.json');
      const data = await res.json(); state.data = data;
      renderProfile(data.profile||{});
      renderSkills(data.skills||{});
      renderExperience(data.experience||[]);
      renderCerts(data.certifications||[]);
      renderEducation(data.education||[]);
      renderTalks(data.talks||[]);
      renderProjectTags(data.projects||[]);
      renderProjects(data.projects||[]);
    }catch(err){
      console.error(err);
      const el = document.getElementById('profileContent');
      if(el) el.textContent = 'Failed to load data.';
    }
  }

  init();
})();