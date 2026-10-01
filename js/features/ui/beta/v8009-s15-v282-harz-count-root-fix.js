/* Root cause fix: old resource CSS sets the Harz <b> wrapper to font-size:0.
   The number is now a standalone DIV, so no inherited legacy wrapper can hide it. */
function v282PaintHarzCard(){return false}


/* Stop older Harz painters from rebuilding the old hidden wrapper structure. */
v279BuildHarzCard=v282PaintHarzCard;
v281PaintHarzAmount=v282PaintHarzCard;

/* V8.009: v282 render/timer repair retired; v283 is the sole Harz DOM owner. */
