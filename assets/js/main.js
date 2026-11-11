import { initTheme } from './theme.js';
import { initNav } from './nav.js';
import { initRequestPanel } from './request-panel.js';
import { initSkills } from './skills.js';
import { initProjects } from './projects.js';
import { initContact } from './contact.js';
import { initSpotlight } from './motion/spotlight.js';
import { initMarquee } from './motion/marquee.js';
import { initWordHighlight } from './motion/word-highlight.js';

const year = document.querySelector('[data-year]');
if (year) year.textContent = String(new Date().getFullYear());

initTheme();
initNav();
initSpotlight();
initMarquee();
initWordHighlight();
initRequestPanel();
initSkills();
initProjects();
initContact();
