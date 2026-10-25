/* Browser-native speech only. Nonlocal/unknown-service voices require per-voice consent. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),api=window.TSMNarration,guided=window.TSMGuidedDemo,clock=window.TSMShowcaseClock;
 const native=window.speechSynthesis;
 const supported=!!native&&typeof window.SpeechSynthesisUtterance==='function'&&['speak','cancel','pause','resume','getVoices'].every(k=>typeof native[k]==='function');
 let voices=[],selected='',consentKey='',engine,preview=null,previewGeneration=0;
 const format=seconds=>String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(Math.floor(seconds%60)).padStart(2,'0');
 const selectedVoice=()=>voices.find(v=>api.voiceKey(v)===selected);
 const permitted=voice=>!!voice&&(voice.localService===true||consentKey===api.voiceKey(voice)&&$('narration-network-consent').checked);
 const speech=supported?{makeUtterance:text=>new window.SpeechSynthesisUtterance(text),speak:u=>native.speak(u),cancel:()=>native.cancel(),pause:()=>native.pause(),resume:()=>native.resume()}:null;
 function render(state){
  document.body.classList.toggle('narrated-demo',state.managed);
  const allowed=permitted(selectedVoice()),playing=['speaking','starting'].includes(state.state);
  $('narration-play').disabled=!supported||!allowed||playing||state.state==='paused'||state.state==='completed';
  $('narration-pause').disabled=!playing;$('narration-resume').disabled=state.state!=='paused'||!allowed;
  $('narration-stop').disabled=!preview&&(!state.managed||['stopped','completed'].includes(state.state));
  $('narration-restart').disabled=!supported||!allowed;$('narration-replay').disabled=!supported||!allowed;
  $('narration-test-voice').disabled=!supported||!allowed;
  $('narration-refresh-voices').disabled=!supported;
  $('narration-mute').disabled=!supported;
  $('narration-mute').setAttribute('aria-pressed',String(state.muted));$('narration-mute').textContent=state.muted?'UNMUTE':'MUTE';
  $('narration-voice').disabled=!voices.length;
  if($('narration-status').textContent!==state.message)$('narration-status').textContent=state.message;
  $('narration-elapsed').textContent=format(state.elapsed)+' elapsed'+(state.elapsed>=480?' · beyond 08:00 target':'');
  $('narration-progress').value=state.completedSteps.length;
  $('narration-progress-text').textContent=state.completedSteps.length+' / '+state.totalSteps+' steps finished';
  if(guided.snapshot().active)$('mode-description').textContent=state.managed?'Auto-narrated guided demo · eight minutes is a target':'Linear 16-step executive walkthrough';
 }
 engine=api.createNarration({speech,clock,steps:window.TSMGuidedSteps,getIndex:()=>guided.snapshot().index,selectStep:index=>guided.select(index),getVoice:selectedVoice,canUseVoice:permitted,onChange:render});
 function stopPreview(){
  previewGeneration++;const previous=preview;preview=null;if(previous)clearTimeout(previous.timer);
  if(previous){try{native.cancel();}catch{$('narration-test-status').textContent='Voice test cancellation failed. Mute this browser tab before continuing.';render(engine.snapshot());return false;}}
  render(engine.snapshot());return true;
 }
 function consentDisplay(){
  const voice=selectedVoice(),needs=!!voice&&voice.localService!==true;
  $('narration-network-warning').hidden=!needs;
  $('narration-network-detail').textContent=needs?voice.name+' · '+voice.lang+' · '+(voice.localService===false?'nonlocal voice':'service locality unknown')+'. The browser or OS may send the spoken text to its network speech service. Selection alone is not consent.':'';
 }
 function refreshVoices(){
  const old=selected;let available=[],failed=false;try{available=supported?native.getVoices():[];}catch{failed=true;}
  voices=api.englishVoices(available);
  const fallback=api.preferredVoice(api.localVoices(voices));
  // Network-capable voices are never auto-selected, including when arriving late.
  selected=voices.some(v=>api.voiceKey(v)===old)?old:fallback?api.voiceKey(fallback):'';
  if(old!==selected){consentKey='';$('narration-network-consent').checked=false;stopPreview();engine.voiceChanged();}
  $('narration-voice').replaceChildren();
  const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent=voices.length?'Choose an English voice…':'No English voices available yet';$('narration-voice').append(placeholder);
  const recommendation=api.preferredVoice(voices);
  for(const voice of voices){const option=document.createElement('option');option.value=api.voiceKey(voice);option.textContent=voice.name+' · '+voice.lang+' · '+(voice.localService===true?'LOCAL':'MAY USE NETWORK · consent required')+(recommendation&&api.voiceKey(voice)===api.voiceKey(recommendation)?' · recommended':'');$('narration-voice').append(option);}
  $('narration-voice').value=selected;consentDisplay();
  const local=api.localVoices(voices).length;
  $('narration-voice-note').textContent=!supported?'SpeechSynthesis is unavailable here. Use captions and MANUAL MODE.':failed?'Voice discovery failed. Click REFRESH VOICES after checking Chrome/ChromeOS speech settings; manual mode remains available.':!voices.length?'Chrome/OS returned no English voices yet. Wait for voices to load, click REFRESH VOICES, and check installed English text-to-speech voices in ChromeOS accessibility/speech settings. Reload this page after an OS voice change. Manual mode and captions still work.':voices.length+' English voice(s), '+local+' reported local. '+(recommendation?'Recommended: '+recommendation.name+' ('+recommendation.lang+'). ':'')+'Prefers an en-US feminine-name voice; actual gender/accent is OS-dependent. Only local voices may be preselected. Select and explicitly consent before using a network-capable voice.';
  render(engine.snapshot());
 }
 function testVoice(){
  if(!supported||document.hidden||!permitted(selectedVoice()))return;
  if(!stopPreview())return;
  if(engine.snapshot().state==='error')engine.stop();
  else engine.voiceChanged(); // Pause/cancel any demo utterance; never advance its step.
  if(engine.snapshot().state==='error')return;
  try{native.cancel();native.resume();}catch{$('narration-test-status').textContent='The browser could not prepare a voice test. Use MANUAL MODE.';return;}
  let utterance;try{utterance=new window.SpeechSynthesisUtterance('This is the TSM executive demo voice test. Clear recommendations, human oversight, and auditable decisions.');}catch{$('narration-test-status').textContent='The browser could not create a voice sample.';return;}
  const voice=selectedVoice();utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=0.95;utterance.pitch=1;utterance.volume=engine.snapshot().muted?0:1;
  const entry={generation:++previewGeneration,timer:null};preview=entry;const live=()=>preview===entry&&entry.generation===previewGeneration;
  const done=text=>{if(!live())return;clearTimeout(entry.timer);preview=null;$('narration-test-status').textContent=text;render(engine.snapshot());};
  utterance.onstart=()=>{if(!live())return;clearTimeout(entry.timer);$('narration-test-status').textContent='Testing '+voice.name+(utterance.volume===0?' · muted':'')+' · '+(voice.localService===true?'local':'network-capable, explicitly permitted')+'.';};
  utterance.onend=()=>done('Voice test complete. No demo step, playback progress or timer was advanced.');
  utterance.onerror=()=>{if(!live())return;stopPreview();$('narration-test-status').textContent='Voice test failed or playback was blocked. Check browser audio/voice settings and click TEST VOICE again; manual mode remains available.';};
  entry.timer=setTimeout(()=>{if(live()){stopPreview();$('narration-test-status').textContent='Voice test did not start. Check browser audio/voice settings and retry explicitly.';}},5000);
  $('narration-test-status').textContent='Starting voice test…';render(engine.snapshot());
  try{native.speak(utterance);}catch{stopPreview();$('narration-test-status').textContent='Voice test could not start. Check browser audio settings or use MANUAL MODE.';}
 }
 function audio(action){if(!document.hidden&&stopPreview())action();}
 $('narration-play').onclick=()=>audio(()=>engine.play());
 $('narration-pause').onclick=()=>{stopPreview();engine.pause();};
 $('narration-resume').onclick=()=>audio(()=>engine.resume());
 $('narration-stop').onclick=()=>{const ok=stopPreview();if(ok&&engine.snapshot().managed)engine.stop();};
 $('narration-restart').onclick=()=>audio(()=>engine.restart());
 $('narration-replay').onclick=()=>audio(()=>engine.replay());
 $('narration-mute').onclick=()=>{if(stopPreview())engine.setMuted(!engine.snapshot().muted);};
 $('narration-manual').onclick=()=>{stopPreview();engine.manual();};
 $('narration-test-voice').onclick=testVoice;
 $('narration-refresh-voices').onclick=refreshVoices;
 $('narration-voice').onchange=()=>{stopPreview();selected=$('narration-voice').value;consentKey='';$('narration-network-consent').checked=false;consentDisplay();engine.voiceChanged();render(engine.snapshot());};
 $('narration-network-consent').onchange=()=>{stopPreview();const voice=selectedVoice();consentKey=voice&&voice.localService!==true&&$('narration-network-consent').checked?api.voiceKey(voice):'';engine.voiceChanged();render(engine.snapshot());};
 for(const id of ['start','pause','reset'])$(id).addEventListener('click',event=>{
  const state=engine.snapshot();if(!state.managed)return;event.preventDefault();event.stopImmediatePropagation();
  if(!stopPreview())return;if(id==='pause')engine.pause();else if(id==='reset')engine.reset();else if(state.state==='paused')engine.resume();else if(state.state!=='completed'&&!document.hidden)engine.play();
 },true);
 document.addEventListener('tsm:guided-step',event=>{if(event.detail.source!=='narration'){stopPreview();engine.manual(event.detail.index);}});
 document.addEventListener('tsm:guided-mode',event=>{if(!event.detail.active){stopPreview();engine.manual();}});
 document.addEventListener('tsm:guided-qa',()=>{stopPreview();engine.pause('Paused for technical Q&A. Click RESUME explicitly when ready.');});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stopPreview();engine.pause('Paused because this tab is hidden. Return and click RESUME explicitly.');}});
 for(const name of ['pagehide','beforeunload'])window.addEventListener(name,()=>{stopPreview();engine.stop();});
 for(const name of ['popstate','hashchange'])window.addEventListener(name,()=>{stopPreview();engine.manual();});
 if(supported){if(typeof native.addEventListener==='function')native.addEventListener('voiceschanged',refreshVoices);else{const prior=native.onvoiceschanged;native.onvoiceschanged=event=>{try{if(typeof prior==='function')prior.call(native,event);}finally{refreshVoices();}};}}
 refreshVoices();render(engine.snapshot());setInterval(()=>render(engine.snapshot()),250);
})();
