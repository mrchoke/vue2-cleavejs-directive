import Cleave from './Cleave'
import { DirectiveBinding, DirectiveOptions } from 'vue/types/options'
import { CleaveElement } from '../src/types'

const CleaveDirectiveOpt: DirectiveOptions = {
  bind(el: CleaveElement, binding: DirectiveBinding) {
    el.cleave = new Cleave(el, binding.value)
  }
}

export default CleaveDirectiveOpt
