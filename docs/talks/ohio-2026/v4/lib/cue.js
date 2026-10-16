// Cue engine. window.T = {dur, sent:[{start,end,words:[{w,s}]}]} is injected by the renderer.
// In a slide:  data-in="7"         appears when sentence 7 starts
//              data-in="16:horse"  appears when the word "horse" is said in sentence 16
//              data-in="16:horse+0.4" / "7-0.2"   with an offset in seconds
//              data-out="12"       fades out when sentence 12 starts
//              data-fx="fade|rise|pop|left|right|drop|draw|wipe"  (default rise)
// Slide scripts can call CUE("16:horse") for a time in seconds, and A(el, keyframes, at, dur) to animate.
(function(){
  const T = window.T || {dur: 60, sent: []};
  const norm = s => s.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, '');
  window.CUE = function(spec){
    const m = String(spec).match(/^(\d+)(?::(=?[^+\-]+(?:-[^+\-\d][^+\-]*)*))?([+\-][\d.]+)?$/);
    if(!m) throw new Error('bad cue '+spec);
    const k = +m[1], word = m[2], off = m[3] ? +m[3] : 0;
    const s = T.sent[k-1]; if(!s) throw new Error('no sentence '+k);
    let t = s.start;
    if(word){
      const exact = word.startsWith('='); const w = norm(exact ? word.slice(1) : word);
      const hit = (s.words||[]).find(x => exact ? norm(x.w) === w : norm(x.w).includes(w));
      if(!hit) throw new Error('no word "'+word+'" in sentence '+k);
      t = hit.s;
    }
    return Math.max(0, t + off);
  };
  window.A = function(el, kf, at, dur, fill){
    return el.animate(kf, {delay: at*1000, duration: (dur||0.6)*1000, fill: fill||'both', easing: 'cubic-bezier(.2,.8,.3,1)'});
  };
  const FX = {
    fade: [{opacity:0},{opacity:1}],
    rise: [{opacity:0, transform:'translateY(36px)'},{opacity:1, transform:'none'}],
    pop:  [{opacity:0, transform:'scale(.6)'},{opacity:1, transform:'scale(1.06)', offset:.7},{opacity:1, transform:'none'}],
    left: [{opacity:0, transform:'translateX(-60px)'},{opacity:1, transform:'none'}],
    right:[{opacity:0, transform:'translateX(60px)'},{opacity:1, transform:'none'}],
    drop: [{opacity:0, transform:'translateY(-40px)'},{opacity:1, transform:'none'}],
    draw: [{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0 0 0)'}],
    wipe: [{clipPath:'inset(0 0 100% 0)'},{clipPath:'inset(0 0 0 0)'}],
  };
  window.addEventListener('DOMContentLoaded', () => {
    const errs = [];
    document.querySelectorAll('[data-in]').forEach(el => {
      try { A(el, FX[el.dataset.fx || 'rise'], CUE(el.dataset.in), +(el.dataset.dur||0.6)); } catch(e){ errs.push(e.message); }
    });
    document.querySelectorAll('[data-out]').forEach(el => {
      try { A(el, [{opacity:1},{opacity:0}], CUE(el.dataset.out), 0.5, 'forwards'); } catch(e){ errs.push(e.message); }
    });
    if (window.SLIDE) try { window.SLIDE(); } catch(e){ errs.push('SLIDE: '+e.message); }
    window.CUE_ERRORS = errs;
  });
})();
