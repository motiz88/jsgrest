start
= selectFieldList;

selectFieldList
= !. {return [];}
/ ws* first:field rest:(ws* ',' ws* f:field ws* {return f;})*
  {return [first].concat(rest || []);}
;

field
= f:fieldName c:cast? {return Object.assign({name: f.trim()}, c ? {cast: c.trim()} : {});};

fieldName
= $([^:,]+);

cast
= '::' t:typeName { return t;}
;

typeName
= $([^,]+);

ws "whitespace" = $([\t\v\f \u00A0\uFEFF\r\n] / Zs);

Zs "Separator, Space"
= [\u0020\u00A0\u1680\u180E\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200A]
 / [\u202F\u205F\u3000];
