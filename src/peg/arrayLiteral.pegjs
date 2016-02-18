start
= array;

array
= '{' '}' { return []; }
/ '{' first:value rest:(',' v:value {return v;})* '}' {return [first].concat(rest || []);}

value
= array / $[^{},]+

