/* Native speech state machine only. No provider, storage or operational authority. */
(function(root){
 'use strict';
 const english=v=>v&&typeof v.name==='string'&&typeof v.lang==='string'&&/^en(?:[-_]|$)/i.test(v.lang||'');
 const voiceKey=v=>[v.voiceURI||'',v.lang||'',v.name||'',v.localService===true?'local':'network-or-unknown'].join('|');
 function englishVoices(voices){
  let list;try{list=Array.from(voices||[]);}catch{return [];}const seen=new Set();return list.filter(v=>{if(!english(v)||seen.has(voiceKey(v)))return false;seen.add(voiceKey(v));return true;});
 }
 function localVoices(voices){return englishVoices(voices).filter(v=>v.localService===true);}
 function preferredVoice(voices){
  const score=v=>(/^en[-_]US$/i.test(v.lang)?100:0)+(/\b(samantha|zira|jenny|aria|ava|allison|susan|joanna|michelle|emma|salli|karen|victoria|female)\b/i.test(v.name)?30:0)+(v.localService===true?10:0)+(v.default?5:0);
  return [...englishVoices(voices)].sort((a,b)=>score(b)-score(a)||a.name.localeCompare(b.name))[0]||null;
 }
 function createNarration({speech,clock,steps,getIndex,selectStep,getVoice,canUseVoice=v=>v?.localService===true,onChange=()=>{},setDelay=setTimeout,clearDelay=clearTimeout,timeoutMs=5000}){
  const supported=!!speech&&['speak','cancel','pause','resume','makeUtterance'].every(k=>typeof speech[k]==='function');
  let state=supported?'idle':'unsupported',managed=false,index=getIndex(),muted=false,message=supported?'Choose an English voice and click PLAY. Network-capable voices require explicit consent.':'Browser speech is unavailable. Captions and manual mode remain available.',current=null,generation=0,deadline=null;
  const completed=new Set();
  function snapshot(){return {state,managed,index,muted,supported,message,completedSteps:[...completed].sort((a,b)=>a-b),elapsed:clock.snapshot().elapsed,totalSteps:steps.length};}
  function notify(){onChange(snapshot());}
  function clearWatch(){if(deadline!==null){clearDelay(deadline);deadline=null;}}
  function cancel(){
   generation++;current=null;clearWatch();if(!supported)return true;
   try{speech.cancel();return true;}catch{return false;}
  }
  function fail(reason){const canceled=cancel();clock.pause();state='error';message=canceled?reason:'Speech cancellation failed. Mute this browser tab and use MANUAL MODE before retrying.';notify();}
  function watch(entry){clearWatch();if(current!==entry)return;deadline=setDelay(()=>{if(current===entry&&state==='starting')fail('Playback did not start or resume. Click PLAY or REPLAY after checking the browser voice/audio settings, or use MANUAL MODE.');},timeoutMs);}
  function finish(entry){
   if(current!==entry||entry.generation!==generation||!managed)return;
   if(!entry.started){fail('The browser ended speech before playback started. No step was advanced. Retry explicitly or use MANUAL MODE.');return;}
   clearWatch();
   if(state==='paused'){entry.ended=true;return;}
   current=null;clock.pause();completed.add(index);
   if(index===steps.length-1){state='completed';message='Reached the end of the guided sequence. Playback finished '+completed.size+' of '+steps.length+' steps. This is presentation progress only.';notify();return;}
   index++;startStep();
  }
  function permitted(voice){try{return english(voice)&&canUseVoice(voice)===true;}catch{return false;}}
  function startStep(){
   if(!supported){state='unsupported';message='Browser speech is unavailable. Use captions and MANUAL MODE.';notify();return;}
   const voice=getVoice();
   if(!permitted(voice)){fail('Select an available English voice. A voice that may use network services requires explicit consent before PLAY, RESUME or REPLAY.');return;}
   if(!cancel()){clock.pause();state='error';message='Speech cancellation failed. Mute the browser tab and use MANUAL MODE; another utterance was not queued.';notify();return;}
   clock.pause();selectStep(index);
   let utterance;try{utterance=speech.makeUtterance(steps[index].say);}catch{fail('The browser could not create narration. Use MANUAL MODE.');return;}
   utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=0.95;utterance.pitch=1;utterance.volume=muted?0:1;
   const entry={utterance,generation,started:false,ended:false};current=entry;state='starting';message=muted?'Muted playback starting; captions remain visible.':'Starting browser-native narration…';
   const live=()=>current===entry&&entry.generation===generation&&managed;
   const running=()=>{if(!live())return;entry.started=true;clearWatch();if(state==='paused')return;state='speaking';clock.start();message=muted?'Muted · captions and silent playback pacing continue.':'Narrating step '+(index+1)+' of '+steps.length+'.';notify();};
   utterance.onstart=running;utterance.onresume=running;
   utterance.onpause=()=>{if(!live())return;clearWatch();clock.pause();if(state!=='paused')message='Paused. Click RESUME to continue.';state='paused';notify();};
   utterance.onend=()=>{if(live())finish(entry);};
   utterance.onerror=event=>{if(!live())return;const reason=event?.error==='not-allowed'?'Browser playback was blocked. Click PLAY or REPLAY explicitly after checking browser audio permissions.':event?.error==='voice-unavailable'?'The selected voice is unavailable. Select another permitted English voice and retry.':'Browser speech failed. No automatic retry or step advance occurred. Click REPLAY or use MANUAL MODE.';fail(reason);};
   notify();watch(entry);
   try{speech.resume();speech.speak(utterance);}catch{fail('Browser speech could not start. Retry explicitly or use MANUAL MODE.');}
  }
  function play(){
   if(state==='speaking'||state==='starting')return;
   if(state==='paused'){resume();return;}
   if(!managed){clock.pause();clock.reset();completed.clear();}
   managed=true;index=getIndex();startStep();
  }
  function pause(reason='Paused. Click RESUME to continue.'){
   if(!managed||!['speaking','starting'].includes(state))return;
   clearWatch();clock.pause();state='paused';message=reason;
   try{speech.pause();}catch{fail('The browser could not pause speech. Narration was canceled; retry explicitly.');return;}
   notify();
  }
  function resume(){
   if(!managed||state!=='paused')return;
   if(!current){startStep();return;}
   if(!permitted(getVoice())||voiceKey(current.utterance.voice)!==voiceKey(getVoice())){fail('Voice selection or consent changed. Select a permitted voice and explicitly replay this step.');return;}
   if(current.ended){state='speaking';finish(current);return;}
   state='starting';message='Resuming browser narration…';notify();watch(current);
   try{speech.resume();}catch{fail('The browser could not resume. Use REPLAY or MANUAL MODE.');}
  }
  function stop(){
   const ok=cancel();clock.pause();state=ok?'stopped':'error';message=ok?'Stopped. Position and elapsed time are preserved. PLAY restarts this step.':'Cancellation failed. Mute this browser tab before retrying.';notify();
  }
  function manual(next=getIndex()){
   const owned=managed||!!current;const ok=owned?cancel():true;if(owned)clock.pause();managed=false;index=next;state=ok?'manual':'error';message=ok?'Manual mode. Audio and automatic advancement are stopped.':'Cancellation failed. Mute this browser tab; automatic advancement is stopped.';notify();
  }
  function reset(startAudio=false){
   if(!cancel()){fail('Cancellation failed. No restart was queued.');return;}
   clock.pause();clock.reset();completed.clear();index=0;selectStep(index);managed=true;
   state='stopped';message='Reset to Step 1. Audio starts only after an explicit playback click.';notify();if(startAudio)startStep();
  }
  function replay(){
   if(!managed){clock.pause();clock.reset();completed.clear();}
   managed=true;index=getIndex();for(const i of [...completed])if(i>=index)completed.delete(i);startStep();
  }
  function setMuted(value){
   muted=!!value;
   if(managed&&['speaking','starting'].includes(state)){message='Volume changed; replaying this step so the native voice applies it.';startStep();}
   else if(managed&&state==='paused'){if(!cancel()){fail('Cancellation failed. Mute this browser tab.');return;}message='Volume changed while paused. RESUME replays this step with the selected volume.';notify();}
   else notify();
  }
  function voiceChanged(){
   if(managed&&['speaking','starting','paused'].includes(state)){if(!cancel()){fail('Cancellation failed. Mute this browser tab.');return;}clock.pause();state='paused';message='Voice selection changed or became unavailable. RESUME replays this step using the selected permitted English voice.';}notify();
  }
  return Object.freeze({snapshot,play,pause,resume,stop,manual,reset,restart:()=>reset(true),replay,setMuted,voiceChanged});
 }
 const api={englishVoices,localVoices,preferredVoice,voiceKey,createNarration};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.TSMNarration=api;
})(typeof window!=='undefined'?window:globalThis);
