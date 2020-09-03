import './Cleave.js';
import CleaveDirectiveOpt from './CleaveDirective.js';

var plugin = {
    install: function (Vue) {
        Vue.directive('cleave', CleaveDirectiveOpt);
    }
};

export default plugin;
