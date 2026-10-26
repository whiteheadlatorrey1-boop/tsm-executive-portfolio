/* Local MP3 presentation state only; no operational authority or browser TTS. */
(function(root){
 'use strict';
 function createPlayer({media,steps,tracks,clock,getIndex,selectStep,onChange=()=>{},setDelay=setTimeout,clearDelay=clearTimeout,timeoutMs=15000}){
  const supported=!!media&&['play','pause','load','addEventListener','removeEventListener'].every(k=>typeof media[k]==='function')&&Array.isArray(tracks)&&tracks.length===steps.length&&tracks.every((t,i)=>t.id===steps[i].id&&t.src==='assets/audio/'+String(i+1).padStart(2,'0')+'-'+t.id+'.mp3'&&Number.isFinite(t.durationSeconds)&&t.durationSeconds>0);
  let index=getIndex(),state=supported?'ready':'unavailable',managed=false,wanted=false,started=false,heldEnd=false,generation=0,request=0,deadline=null,handlers=[];
  let message=supported?'Ready. Click PLAY NARRATED DEMO to start prerecorded audio. Manual navigation always works.':'Audio manifest unavailable or invalid. Use BACK / NEXT and WHAT TO SAY; audio is optional.';
  const completed=new Set();
  const position=()=>Number.isFinite(media?.currentTime)?media.currentTime:0;
  function snapshot(){return {state,managed,supported,index,message,muted:!!media?.muted,completedSteps:[...completed].sort((a,b)=>a-b),totalSteps:steps.length,elapsed:clock.snapshot().elapsed,position:position(),duration:tracks?.[index]?.durationSeconds||0};}
  function notify(){onChange(snapshot());}
  function clearWatch(){if(deadline!==null){clearDelay(deadline);deadline=null;}}
  function detach(){generation++;request++;clearWatch();for(const [name,fn] of handlers)media.removeEventListener(name,fn);handlers=[];}
  function invalidate(){detach();wanted=false;heldEnd=false;try{media.pause();return true;}catch{return false;}}
  function fail(text){invalidate();clock.pause();state='error';message=text+' Audio stopped; no step was advanced. Retry PLAY, use NEXT / BACK, or choose MANUAL MODE.';notify();}
  function sourceMatches(){return !media.currentSrc||media.currentSrc===media.src;}
  function finish(token){
   if(token!==generation||!started||!sourceMatches()||!media.ended)return;
   const duration=Number.isFinite(media.duration)?media.duration:tracks[index].durationSeconds;
   if(position()+0.25<duration)return;
   clearWatch();clock.pause();
   if(!wanted||state==='paused'){heldEnd=true;return;}
   completed.add(index);
   if(index===steps.length-1){wanted=false;state='completed';message='All selected narration has ended. Presentation progress is not an operational approval or audit record.';notify();return;}
   index++;selectStep(index);if(loadTrack())playCurrent();
  }
  function loadTrack(){
   if(!supported)return false;
   if(!invalidate()){fail('The browser could not stop the previous audio.');return false;}
   started=false;const token=generation;
   const live=()=>token===generation&&sourceMatches();
   function listen(name,fn){const handler=event=>{if(live())fn(event);};media.addEventListener(name,handler);handlers.push([name,handler]);}
   listen('playing',()=>{if(!wanted){media.pause();return;}clearWatch();started=true;state='playing';clock.start();message='Playing step '+(index+1)+' of '+steps.length+'.';notify();});
   listen('pause',()=>{clock.pause();if(wanted&&!media.ended){wanted=false;request++;clearWatch();state='paused';message='Paused. Click RESUME when ready.';notify();}});
   listen('waiting',()=>{if(!wanted)return;clock.pause();state='buffering';message='Waiting for audio. Captions and manual navigation remain available.';watch(token);notify();});
   listen('stalled',()=>{if(!wanted)return;message=state==='playing'?'Audio continues from buffered data; static-file transfer stalled.':'Waiting for static audio data. Manual navigation remains available.';if(state!=='playing')watch(token);notify();});
   listen('ended',()=>finish(token));
   listen('error',()=>fail('This step’s MP3 could not be loaded or decoded.'));
   listen('timeupdate',notify);listen('loadedmetadata',notify);listen('volumechange',notify);
   try{media.src=tracks[index].src;media.load();}catch{fail('The browser could not load this audio file.');return false;}
   return token===generation;
  }
  function watch(token){clearWatch();deadline=setDelay(()=>{if(token===generation&&wanted&&state!=='playing')fail('Audio did not start or buffering timed out.');},timeoutMs);}
  function playCurrent(){
   if(!supported){notify();return;}
   wanted=true;heldEnd=false;state='loading';message='Starting prerecorded audio…';const token=generation,attempt=++request;watch(token);notify();
   try{const promise=media.play();if(promise&&typeof promise.catch==='function')promise.catch(()=>{if(token===generation&&attempt===request&&wanted)fail('Playback was blocked or interrupted. Click PLAY explicitly after checking browser audio permissions.');});}catch{fail('The browser could not start audio.');}
  }
  function play(){
   if(!supported){notify();return;}
   if(['playing','loading','buffering'].includes(state))return;
   if(state==='paused'){resume();return;}
   if(!managed){clock.pause();clock.reset();completed.clear();}
   managed=true;index=getIndex();completed.delete(index);
   if(loadTrack())playCurrent();
  }
  function pause(reason='Paused. Click RESUME to continue.'){
   if(!managed||!['playing','loading','buffering'].includes(state))return;
   wanted=false;request++;clearWatch();clock.pause();state='paused';message=reason;
   try{media.pause();}catch{fail('The browser could not pause audio.');return;}notify();
  }
  function resume(){
   if(!supported||state!=='paused')return;
   if(heldEnd){wanted=true;state='playing';finish(generation);return;}
   playCurrent();
  }
  function stop(){
   const owned=managed;const ok=supported?invalidate():true;if(owned)clock.pause();
   state=ok?'stopped':'error';message=ok?'Stopped at the beginning of this step. Click PLAY to restart it.':'Audio cancellation failed. Mute the tab and use manual navigation.';
   if(ok&&supported){try{media.currentTime=0;media.load();}catch{state='error';message='Could not reset audio. Use MANUAL MODE.';}}
   notify();
  }
  function manual(next=getIndex()){
   const owned=managed;const ok=supported?invalidate():true;if(owned)clock.pause();managed=false;index=next;
   state=ok?'manual':'error';message=ok?'Manual mode. Read WHAT TO SAY and use BACK / NEXT. Audio will not restart automatically.':'Could not cancel audio. Mute this tab; manual navigation remains available.';
   if(ok&&supported)loadTrack();notify();
  }
  function replay(){
   if(!supported)return;
   if(!managed){clock.pause();clock.reset();completed.clear();}
   managed=true;index=getIndex();completed.delete(index);clock.pause();if(loadTrack())playCurrent();
  }
  function reset(startAudio=false){
   if(supported&&!invalidate()){fail('The browser could not cancel audio.');return;}
   clock.pause();clock.reset();completed.clear();index=0;selectStep(index);managed=true;
   state='stopped';message='Reset to Step 1. Click PLAY to begin.';if(supported)loadTrack();notify();if(startAudio&&supported)playCurrent();
  }
  function mute(){if(!supported)return;media.muted=!media.muted;notify();}
  if(supported)loadTrack();
  return Object.freeze({snapshot,play,pause,resume,stop,manual,replay,reset,restart:()=>reset(true),mute});
 }
 const api={createPlayer};if(typeof module==='object'&&module.exports)module.exports=api;else root.TSMRecordedAudio=api;
})(typeof window!=='undefined'?window:globalThis);
