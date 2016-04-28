\timing off

SET client_min_messages TO WARNING;

update pg_database set datallowconn = 'false' where datname = 'postgrest_test';
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'postgrest_test';
DROP DATABASE IF EXISTS postgrest_test;
DROP ROLE IF EXISTS postgrest_test;
CREATE USER postgrest_test createdb createrole;
CREATE DATABASE postgrest_test OWNER postgrest_test;

