// Duplicate the sequence for seamless marquee and enable prefers-reduced-motion
(function(){
  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.brand-track').forEach(track=>{
      const seq = track.querySelector('.brand-seq');
      if(seq){
        // Clone for seamless loop
        const clone = seq.cloneNode(true);
        clone.setAttribute('aria-hidden','true');
        track.appendChild(clone);
        
        // Calculate exact animation duration based on width for smooth scrolling
        const seqWidth = seq.offsetWidth;
        const gap = parseInt(getComputedStyle(track).gap) || 48; // default 3rem = 48px
        const totalWidth = seqWidth + gap;
        
        // Adjust animation duration: ~60px per second for smooth scrolling
        const duration = totalWidth / 60;
        track.style.animationDuration = `${duration}s`;
      }
      
      // Respect reduced motion
      if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
        track.style.animation = 'none';
      }
    });
  });
})();
