/* Standalone read-only rendering. No operational connections or persistent state. */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),data=window.TSMPortfolioData,steps=data.steps;
 const timer=window.TSMShowcaseTimer.createTimer(()=>performance.now());
 let index=0,lastCue='';
 const sections={opening:'01 / Architecture',industrial:'02 / Industrial intelligence',l1:'03 / Enterprise IT guidance',temporal:'04 / Workflow orchestration',governance:'05 / Governance and evidence',close:'06 / Executive close'};
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const format=seconds=>String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(Math.floor(seconds%60)).padStart(2,'0');
 function flow(host,labels,highlight=[]){const list=node('ol',undefined,'guided-flow');labels.forEach((label,i)=>{const item=node('li',undefined,highlight.includes(i)?'emphasis':'');item.append(node('span',String(i+1).padStart(2,'0'),'guided-node-number'),node('strong',label));list.append(item);});host.append(list);}
 function cards(host,entries){const grid=node('dl',undefined,'scenario-cards');for(const [label,value] of entries){const card=node('div');card.append(node('dt',label),node('dd',value));grid.append(card);}host.append(grid);}
 function guidance(view){
  const context='TRAINING CASE INC9900001 · Synthetic IT Support\nVPN sign-in fails after a password change. Scope, exact error and caller identity are unverified.\n';
  const views={
   'l1-guide':'Understand: confirm caller, scope and impact.\nPrepare: collect exact error text, timing, affected asset and approved knowledge references.\nVerify: compare evidence with actual observations.\nTechnician confirmation is required in an authorized workflow before any action.\nStop and escalate security-sensitive, destructive or unsupported requests.\nRecord actual results and a receiving owner; none are established by this presentation.',
   'l1-script':'Draft technician questions:\nPlease confirm symptoms, impact, start time and recent changes. What checks have been tried? Share the exact error without passwords or secrets.\n1. Compare scope and asset to the ticket.\n2. Verify an approved knowledge reference and its prerequisites [pending].\n3. Propose a reversible check and obtain authorization [pending].\n4. Record observed versus expected results [pending].\nNo remediation, successful check or confirmation is inferred.',
   'l1-handoff':'Draft handoff to Synthetic IT Support:\nImpact and reason for escalation: [technician to verify].\nChecks performed and actual results: [not yet observed].\nOutstanding risks, knowledge reference, receiving owner and next update: [required].\nConfirmation, dispatch, execution and resolution: NOT ESTABLISHED.'
  };
  return context+'\n'+views[view];
 }
 function visual(step){
  const host=$('guided-visual');host.replaceChildren();
  host.append(node('p',step.classification+' · READ-ONLY PORTFOLIO','guided-visual-label'));
  if(step.kind==='scenario'){
   const content={
    'industrial-input':[['Scenario','Synthetic battery-storage incident'],['Input type','Illustrative event, not plant telemetry'],['Evidence status','Training assumption · no live source'],['Response boundary','No plant control or external dispatch']],
    'industrial-analysis':[['Scenario risk','74 / 100'],['Modeled exposure','$1.2M–$2.4M'],['Metric basis','Scripted assumptions · not measured losses'],['Decision status','Requires evidence and human review']],
    'industrial-strategist':[['Option 1','Verify the source and scope'],['Option 2','Compare response options and uncertainties'],['Option 3','Identify the authorized decision owner'],['Execution status','No response authorized or executed']],
    'industrial-executive':[['Decision support','Review evidence and uncertainty'],['Human gate','Confirm source ownership and authority'],['Record required','Version-bound decision and acknowledged receipt'],['This portfolio','No approval, execution or outcome recorded']],
    'l1-context':[['Case','INC9900001 · synthetic'],['Symptoms','VPN sign-in fails after password change'],['Missing information','Caller verification, exact error and scope'],['Provider connection','None · local training context only']]
   };
   cards(host,content[step.id]);host.append(node('p','Synthetic scenario illustration. No current event or verified business outcome.','guided-callout'));return;
  }
  if(step.kind==='l1'){
   const output=node('p',guidance(step.id),'local-guidance');output.setAttribute('aria-label','Read-only synthetic technician guidance');host.append(output,node('p','Working deterministic text rendering, with no provider handler, execution button or ticket write.','guided-fallback-note'));return;
  }
  if(step.kind==='workflow'){
   host.append(node('p','PROTOTYPE CONTRACT · NOT A CURRENT RUNNING WORKFLOW','simulation-note'));
   flow(host,['Synthetic import','Validation','Exception analysis','Draft generation','Independent human review','Mock publication','Synthetic audit receipt'],step.highlight);
   host.append(node('p',step.id==='temporal-approval'?'REVIEW REQUIRED · No approval signal is sent.':step.id==='temporal-outcome'?'Mock outcome pattern · No completed execution is claimed.':'Separate controlled stages · No workflow is started.','guided-callout'));return;
  }
  if(step.kind==='governance'){flow(host,['Verified identity','Tenant and client membership','Authorized document operations','Approved storage and scanning']);host.append(node('p','Access remains blocked until trusted contracts are established. No private workspace is included.','guided-callout'));return;}
  if(step.kind==='documents'){flow(host,['Draft','In review','Approved internally','Archived']);host.append(node('p','Simulated lifecycle · Internal approval is not a signature, legal execution or permission to publish.','guided-callout'));return;}
  if(step.kind==='receipt'){flow(host,['Source evidence','Named human decision','Authorized action','Acknowledged audit receipt']);host.append(node('p','Required evidence pattern only · No trusted receipt or authorized action is created.','guided-callout'));return;}
  flow(host,['Operational signal','Detection and risk','Strategic recommendation','Executive decision support','Workflow orchestration','Human approval','Auditable outcome']);host.append(node('p',step.kind==='close'?'Which part would you pressure-test first?':'Connected architecture · separate trust boundaries','guided-callout'));
 }
 function tick(){
  const t=timer.snapshot(),step=steps[index];
  $('countdown').textContent=t.elapsed>480?'+'+format(t.elapsed-480):format(t.remaining);
  $('elapsed').textContent=format(t.elapsed)+' elapsed';$('progress').value=t.elapsed;
  $('start').disabled=t.running||t.finished;$('pause').disabled=!t.running;
  const text=!$('guided-show-timer').checked?'Timer hidden. Audio is optional; advance manually.':document.body.classList.contains('narrated-demo')?'Narration advances only after each script ends. Eight minutes is a target.':t.elapsed>=step.end&&index<15?'TIME CUE · Next: '+steps[index+1].title+'. Advance when ready.':format(step.start)+'–'+format(step.end)+' · BACK / NEXT or arrow keys · No automatic manual-mode advance.';
  if(text!==lastCue){$('guided-timing').textContent=text;lastCue=text;}
 }
 function select(next,focus=true,source='manual'){
  index=Math.max(0,Math.min(steps.length-1,next));const step=steps[index];
  $('guided-heading').textContent=(index+1)+'. '+step.title;$('guided-counter').textContent='STEP '+(index+1)+' OF '+steps.length;
  $('guided-section').textContent=sections[step.section];$('guided-classification').textContent=step.classification;
  $('guided-say').textContent=step.say;$('guided-disclosure').textContent=step.disclosure;
  $('guided-back').disabled=index===0;$('guided-next').disabled=index===steps.length-1;
  $('guided-next').textContent=index<15?'NEXT: '+(index+2)+'. '+steps[index+1].title+' →':'END OF PORTFOLIO';
  visual(step);lastCue='';tick();document.dispatchEvent(new CustomEvent('tsm:guided-step',{detail:{index,source,active:true}}));
  if(focus)$('guided-heading').focus();
 }
 $('start').onclick=()=>{timer.start();tick();};$('pause').onclick=()=>{timer.pause();tick();};$('reset').onclick=()=>{timer.reset();tick();};
 $('guided-back').onclick=()=>select(index-1);$('guided-next').onclick=()=>select(index+1);
 $('guided-show-timer').onchange=()=>{document.body.classList.toggle('guided-timer-hidden',!$('guided-show-timer').checked);tick();};
 const dialog=$('guided-qa');
 for(const [question,answer] of data.qa){const item=node('details');item.append(node('summary',question),node('p',answer));$('guided-qa-content').append(item);}
 $('guided-qa-open').onclick=()=>{document.dispatchEvent(new Event('tsm:guided-qa'));if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');$('guided-qa-close').focus();};
 $('guided-qa-close').onclick=()=>{if(typeof dialog.close==='function')dialog.close();else{dialog.removeAttribute('open');$('guided-qa-open').focus();}};
 dialog.addEventListener('close',()=>$('guided-qa-open').focus());
 document.addEventListener('keydown',event=>{
  if(dialog.open||event.altKey||event.ctrlKey||event.metaKey||event.target.closest('input,textarea,select,button,a,summary,[contenteditable]'))return;
  if(event.key==='ArrowRight'){event.preventDefault();select(index+1);}
  if(event.key==='ArrowLeft'){event.preventDefault();select(index-1);}
  if(event.code==='Space'&&$('guided-show-timer').checked){event.preventDefault();if(!$('pause').disabled)$('pause').click();else $('start').click();}
 });
 window.TSMGuidedDemo=Object.freeze({snapshot:()=>({active:true,index}),select:next=>select(next,false,'narration')});
 window.TSMShowcaseClock=Object.freeze({snapshot:timer.snapshot,start(){timer.allowOvertime();timer.start();tick();},pause(){timer.pause();tick();},reset(){timer.reset();tick();}});
 select(0,false);setInterval(tick,250);
})();
