/* Packaged MP3 playback only. No provider, voice discovery or persistent storage. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),guided=window.TSMGuidedDemo,clock=window.TSMShowcaseClock;
 const format=n=>String(Math.floor(n/60)).padStart(2,'0')+':'+String(Math.floor(n%60)).padStart(2,'0');
 function render(s){
  document.body.classList.toggle('narrated-demo',s.managed);
  const running=['playing','loading','buffering'].includes(s.state);
  $('narration-play').disabled=!s.supported||running||s.state==='paused';
  $('narration-play').textContent=s.state==='error'?'RETRY PLAY':'PLAY NARRATED DEMO';
  $('narration-pause').disabled=!running;$('narration-resume').disabled=s.state!=='paused';
  $('narration-stop').disabled=!s.supported||!s.managed||s.state==='stopped';
  for(const id of ['narration-restart','narration-replay','narration-mute'])$(id).disabled=!s.supported;
  $('narration-mute').setAttribute('aria-pressed',String(s.muted));$('narration-mute').textContent=s.muted?'UNMUTE':'MUTE';
  $('narration-status').textContent=s.message;$('narration-elapsed').textContent=format(s.elapsed)+' elapsed';
  $('narration-progress').value=s.completedSteps.length;$('narration-progress-text').textContent=s.completedSteps.length+' / '+s.totalSteps+' clips ended';
  $('narration-position').value=Math.min(s.position,s.duration);$('narration-position').max=s.duration||1;
  $('narration-position-text').textContent='Step '+(s.index+1)+' audio · '+format(s.position)+' / '+format(s.duration);
  $('mode-description').textContent=s.managed?'Prerecorded guided demo · eight minutes is a target':'Manual 16-step portfolio walkthrough';
 }
 const player=window.TSMRecordedAudio.createPlayer({media:$('narration-audio'),steps:window.TSMGuidedSteps,tracks:window.TSMRecordedTracks||[],clock,getIndex:()=>guided.snapshot().index,selectStep:index=>guided.select(index),onChange:render});
 const start=action=>{if(!document.hidden&&!$('guided-qa').open)action();};
 $('narration-play').onclick=()=>start(()=>player.play());$('narration-pause').onclick=()=>player.pause();$('narration-resume').onclick=()=>start(()=>player.resume());
 $('narration-stop').onclick=()=>player.stop();$('narration-restart').onclick=()=>start(()=>player.restart());$('narration-replay').onclick=()=>start(()=>player.replay());
 $('narration-manual').onclick=()=>player.manual();$('narration-mute').onclick=()=>player.mute();
 document.addEventListener('tsm:guided-step',event=>{if(event.detail.source!=='narration')player.manual(event.detail.index);});
 document.addEventListener('tsm:guided-qa',()=>player.pause('Paused for technical Q&A. Click RESUME explicitly after closing it.'));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)player.pause('Paused because the tab is hidden. Return and click RESUME explicitly.');});
 for(const event of ['pagehide','beforeunload'])window.addEventListener(event,()=>player.stop());
 for(const event of ['hashchange','popstate'])window.addEventListener(event,()=>player.manual());
 for(const id of ['start','pause','reset'])$(id).addEventListener('click',event=>{
  const s=player.snapshot();if(!s.managed)return;event.preventDefault();event.stopImmediatePropagation();
  if(id==='pause')player.pause();else if(id==='reset')player.reset();else start(()=>s.state==='paused'?player.resume():player.play());
 },true);
 render(player.snapshot());setInterval(()=>render(player.snapshot()),250);
})();
