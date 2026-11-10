import { initTheme } from './theme.js';
import { initNav } from './nav.js';
import { initRequestPanel } from './request-panel.js';
import { initSkills } from './skills.js';
import { initProjects } from './projects.js';
import { initContact } from './contact.js';

const year = document.querySelector('[data-year]');
if (year) year.textContent = String(new Date().getFullYear());

initTheme();
initNav();
initRequestPanel();
initSkills();
initProjects();
initContact();
