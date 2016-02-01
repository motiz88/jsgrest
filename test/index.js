import ModuleEntryPoint from '../src';
import chai, {expect} from 'chai';

before(function() {
    chai.use(require('chai-http'));
    chai.use(require('sinon-chai'));
    chai.use(require('chai-things'));
    chai.use(require('chai-subset'));
    chai.should();
});

describe('module entry point', function() {
    it('should be defined', function() {
        expect(ModuleEntryPoint).to.exist;
    });
});

// const testsContext = require.context('./specs/', true, /\.js$/);

// testsContext.keys().forEach(testsContext);

// const componentsContext = require.context('../src/', true, /\.js$/);

// componentsContext.keys().forEach(componentsContext);
