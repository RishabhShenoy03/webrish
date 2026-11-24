const prefersReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let headerAvatarObserver;

function initPage(){
  const year=document.querySelector('[data-year]');
  if(year) year.textContent=new Date().getFullYear();
  document.body.classList.remove('page-leaving');

  const portrait=document.querySelector('.home-page .hero-portrait');
  const headerAvatar=document.querySelector('.home-page .header-avatar');
  if(headerAvatarObserver){
    headerAvatarObserver.disconnect();
    headerAvatarObserver=null;
  }
  if(portrait&&headerAvatar){
    headerAvatarObserver=new IntersectionObserver(([entry])=>headerAvatar.classList.toggle('visible',!entry.isIntersecting),{threshold:.12});
    headerAvatarObserver.observe(portrait);
  }

  const header=document.querySelector('.site-header');
  if(header){
    const updateHeader=()=>{
      const portraitBottom=portrait?.getBoundingClientRect().bottom ?? 0;
      header.classList.toggle('scrolled',window.scrollY>24 && (!portrait || portraitBottom<84));
    };
    window.removeEventListener('scroll',window.__rishabhHeaderScroll);
    window.__rishabhHeaderScroll=updateHeader;
    window.addEventListener('scroll',updateHeader,{passive:true});
    updateHeader();
  }
}

initPage();

// Native anchor links remain usable without intercepting browser navigation.
const checkpoints=[];
function checkpoint(element,label){if(!element)return;if(!element.id)element.id='checkpoint-'+checkpoints.length;element.dataset.checkpoint='';checkpoints.push({element,label});}
if(document.body.classList.contains('home-page')){
 for(const [id,label] of [['introduction','Hello'],['selected-work','Work'],['experience','Experience'],['education','Education'],['field-notes','Travels'],['contact','Contact']])checkpoint(document.getElementById(id),label);
}else if(document.querySelector('.project-gallery')){
 checkpoint(document.querySelector('.projects-intro'),'Overview');document.querySelectorAll('.work-card').forEach(e=>checkpoint(e,e.querySelector('h2').textContent));
}else if(document.querySelector('.travel-index')){
 checkpoint(document.querySelector('.projects-intro'),'Overview');document.querySelectorAll('.travel-entry').forEach(e=>checkpoint(e,e.querySelector('h2').textContent));
}else{
 checkpoint(document.querySelector('.trip-intro'),'Overview');document.querySelectorAll('.trip-content section[id]').forEach(e=>checkpoint(e,e.id.replace('Background of Korea Trip','Background').replace('Background of Chiang Mai Trip','Background')));
}
if(checkpoints.length){
 const nav=document.createElement('nav');nav.className='checkpoints';nav.setAttribute('aria-label','Page checkpoints');
 checkpoints.forEach(({element,label})=>{const a=document.createElement('a');a.href='#'+encodeURIComponent(element.id);a.innerHTML='<span class="checkpoint-dot" aria-hidden="true"></span>';const text=document.createElement('span');text.className='checkpoint-label';text.textContent=label;a.append(text);nav.append(a)});document.body.append(nav);
 let queued=false;function update(){let active=0;checkpoints.forEach(({element},i)=>{if(element.getBoundingClientRect().top<=Math.min(220,innerHeight*.35))active=i});[...nav.children].forEach((a,i)=>{if(i===active)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current')});queued=false}
 addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update)}},{passive:true});addEventListener('resize',update);update();
}
