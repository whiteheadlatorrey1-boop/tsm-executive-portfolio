(function(root){'use strict';
function createTimer(now){let elapsed=0,started=null;let limit=480;
 const time=()=>Math.min(limit,elapsed+(started===null?0:Math.max(0,(now()-started)/1000)));
 return {start(){if(started===null&&elapsed<limit)started=now();},pause(){elapsed=time();started=null;},reset(){elapsed=0;started=null;limit=480;},allowOvertime(){limit=Infinity;},snapshot(){const seconds=time();if(seconds>=limit){elapsed=limit;started=null;}return {elapsed:seconds,remaining:Math.max(0,480-Math.floor(seconds)),running:started!==null,finished:seconds>=limit};}};}
if(typeof module==='object'&&module.exports)module.exports={createTimer};else root.TSMShowcaseTimer={createTimer};
})(typeof window!=='undefined'?window:globalThis);
