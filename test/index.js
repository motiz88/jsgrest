import ModuleEntryPoint from '../src';
import {expect} from 'chai';
import createApp from '../src/app';

describe('module entry point', function() {
    it('should be defined', function() {
        expect(ModuleEntryPoint).to.exist;
    });
    it('should be createApp', function() {
        ModuleEntryPoint.should.equal(createApp);
    });
});

// const testsContext = require.context('./specs/', true, /\.js$/);

// testsContext.keys().forEach(testsContext);

// const componentsContext = require.context('../src/', true, /\.js$/);

// componentsContext.keys().forEach(componentsContext);
