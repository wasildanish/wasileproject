// Shared JS for navigation, filtering and compare
document.addEventListener('DOMContentLoaded', function(){
  // Preloader hide logic
  var preloader = document.getElementById('preloader');
  if (preloader) {
    setTimeout(function() {
      preloader.style.opacity = '0';
      setTimeout(function(){ preloader.style.display = 'none'; }, 500);
    }, 400); // show at least 400ms
  }
  // Fantastic scroll-reveal animation
  function revealOnScroll() {
    var reveals = document.querySelectorAll('.reveal');
    var windowHeight = window.innerHeight;
    for (var i = 0; i < reveals.length; i++) {
      var elementTop = reveals[i].getBoundingClientRect().top;
      if (elementTop < windowHeight - 60) {
        reveals[i].classList.add('visible');
      } else {
        reveals[i].classList.remove('visible');
      }
    }
  }
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll();
  // set active nav link
  var path = location.pathname.split('/').pop() || 'home.html';
  document.querySelectorAll('nav a').forEach(function(a){
    var href = a.getAttribute('href');
    if(href && href.indexOf(path) !== -1) a.classList.add('active');
  });

  // mobile menu: look up the controlled nav via aria-controls (robust fallback)
  var menuToggle = document.getElementById('menuToggle');
  if (menuToggle) {
    var controlledId = menuToggle.getAttribute('aria-controls');
    var mobileNav = document.getElementById(controlledId) || document.getElementById('mobileNav') || null;

    var toggleNav = function() {
      var expanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!expanded));
      if (mobileNav && mobileNav.classList) {
        mobileNav.classList.toggle('open');
      } else {
        // fallback: toggle display on primaryNav if present
        var primary = document.getElementById('primaryNav');
        if (primary) {
          var isOpen = primary.style.display === 'block';
          primary.style.display = isOpen ? '' : 'block';
        }
      }
    };

    menuToggle.addEventListener('click', toggleNav);

    // keyboard support (Enter / Space)
    menuToggle.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){
        e.preventDefault();
        toggleNav();
      }
    });

    // close when clicking outside the nav on small screens
    document.addEventListener('click', function(e){
      var target = e.target;
      if (!menuToggle.contains(target)){
        if (mobileNav && mobileNav.classList && mobileNav.classList.contains('open') && !mobileNav.contains(target)){
          mobileNav.classList.remove('open');
          menuToggle.setAttribute('aria-expanded','false');
        }
        var primary = document.getElementById('primaryNav');
        if (primary && primary.style.display === 'block' && !primary.contains(target) && !menuToggle.contains(target)){
          primary.style.display = '';
          menuToggle.setAttribute('aria-expanded','false');
        }
      }
    });
  }

  // product filtering (if on products page)
  if(window.initProductFilters) initProductFilters();

  // compare buttons
  document.querySelectorAll('.compare-toggle').forEach(function(btn){
    btn.addEventListener('click', function(){
      var id = this.dataset.id;
      var name = this.dataset.name;
      var list = JSON.parse(localStorage.getItem('compareList')||'[]');
      var idx = list.findIndex(function(i){return i.id===id});
      if(idx === -1){
        if(list.length >= 3){ alert('You can compare up to 3 items.'); return; }
        list.push({id:id,name:name});
        this.textContent = 'Remove from Compare';
        this.classList.add('active');
      } else {
        list.splice(idx,1);
        this.textContent = 'Add to Compare';
        this.classList.remove('active');
      }
      localStorage.setItem('compareList', JSON.stringify(list));
      updateCompareCount();
    });
  });

  updateCompareCount();
  // brief CTA pulse on load (if user allows motion)
  try {
    if (!window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      var ctas = document.querySelectorAll('.cta');
      ctas.forEach(function(c){ c.classList.add('pulse'); });
      setTimeout(function(){ ctas.forEach(function(c){ c.classList.remove('pulse'); }); }, 12000);
    }
  } catch(e){}
});

function updateCompareCount(){
  var list = JSON.parse(localStorage.getItem('compareList')||'[]');
  var el = document.getElementById('compareCount');
  if(el) el.textContent = list.length;
  // pulse both counter locations when value updates
  try { pulseCompareCount(); } catch(e){}
}


// Enhance compare count with a pulse when it changes
function pulseCompareCount() {
  var el = document.getElementById('compareCount');
  var inline = document.getElementById('compareCountInline');
  [el, inline].forEach(function(node){
    if(!node) return;
    node.classList.remove('count-pulse');
    // force reflow to restart animation
    void node.offsetWidth;
    node.classList.add('count-pulse');
    setTimeout(function(){ node.classList.remove('count-pulse'); }, 900);
  });
}

// Back to top button handler and newsletter demo handler
document.addEventListener('click', function(e){
  var bt = e.target.closest && e.target.closest('#backToTop');
  if(bt){
    window.scrollTo({top:0,behavior:'smooth'});
  }

  var formBtn = e.target.closest && e.target.closest('.site-footer form button');
  if(formBtn){
    e.preventDefault();
    // find the email input and do a tiny validation
    var form = formBtn.closest('form');
    var input = form && form.querySelector('input[type="email"]');
    if(input && input.value && input.value.indexOf('@')>-1){
      alert('Thank you — this is a demo.');
      input.value='';
    } else {
      alert('Please enter a valid email address.');
    }
  }
});
