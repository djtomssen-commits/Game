/* V8.009 Quest consolidation
   Historical V4.178 live-quest fallback retired.

   Canonical owners:
   - v229: one lightweight 1s Quest timer + shared v7119 navigation refresh
   - v392: active-card/timer/claim presentation
   - v6344: canonical Quest render owner

   No interval, v032Go wrapper, startup timer or visibility/pageshow repaint
   is installed here anymore. */
(()=>{
  'use strict';
  window.__v4178QuestLiveFix=true;
  window.__V8009_V4178_QUEST_LIVE_RETIRED__=true;
})();
