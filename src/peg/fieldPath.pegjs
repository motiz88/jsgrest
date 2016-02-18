start
= path;

path
= f:fieldPath j:jsonPath?
{return f.concat(j).filter(Boolean); };

fieldPath
= f:fieldName
{return [{type: 'field', name: f}];};

jsonPath
= steps:jsonPathStep* final:jsonPathFinalStep
{return steps.concat([final]);};

jsonPathFinalStep
= '->>' f:fieldName
{return {type: '->>', name: f};};

jsonPathStep
= '->' f:fieldName
{return {type: '->', name: f};};

fieldName
= $([^\->])+;
