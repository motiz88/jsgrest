# jsgrest
[![Build Status](https://travis-ci.org/motiz88/jsgrest.svg?branch=master)]
(https://travis-ci.org/motiz88/jsgrest)

Postgres REST API server in JavaScript (a la PostgREST).

This is a bare-bones reimplementation of [@begriffs](https://github.com/begriffs)'s fantastic
    [PostgREST] (https://github.com/begriffs/postgrest) in JavaScript.

# Goals
* Maximum API compatibility with PostgREST
* Reasonable performance
* An implementation I can hack on (not being a Haskell coder, I can't do this with PostgREST)

# Progress
`jsgrest` recently [passed](https://travis-ci.org/motiz88/jsgrest/jobs/110553520) a [test suite]
(https://github.com/motiz88/jsgrest/tree/master/test) based largely on PostgREST's own, with some
omissions due to the reduced feature set I'm targeting right now. Following this milestone, I have
my eyes set on achieving full compatibility with PostgREST - help is welcome :smile:.

The [issue list](https://github.com/motiz88/jsgrest/issues) is a good place
to see what's missing at the moment. Notably, `jsgrest` introduces the concept of "pure" mode,
which disables features that require schema inspection/caching, but *non-pure mode is not currently
implemented* ([#1](https://github.com/motiz88/jsgrest/issues/1), [#5]
(https://github.com/motiz88/jsgrest/issues/5), [#7](https://github.com/motiz88/jsgrest/issues/5)).

Tests for "non-pure" and other missing functionality exist but are [flagged with `TODO`]
(https://github.com/motiz88/jsgrest/search?utf8=%E2%9C%93&q=TODO) and not run in the main test
suite.

Please feel free to reach out in any way you like. Issue reports, requests, random thoughts and
PRs are most welcome.

# And hey...
...at least I didn't call it *PostgrESt*.
