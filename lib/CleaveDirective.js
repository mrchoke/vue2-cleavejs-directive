import Cleave from './Cleave.js';

var CleaveDirectiveOpt = {
    bind: function (el, binding) {
        el.cleave = new Cleave(el, binding.value);
    }
};

export default CleaveDirectiveOpt;
