/* V8.009 BETA — shared guild combat timing utility.
   The old V2.59 test-boss renderer is retired. Current Gildenboss and
   Gildenkrieg replay owners only require v259Sleep. */
const v259Sleep=ms=>new Promise(r=>setTimeout(r,Math.max(0,Math.round((Number(ms)||0)*1.25))));
