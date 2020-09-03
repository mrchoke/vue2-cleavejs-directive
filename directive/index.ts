import CleaveDirectiveOpt from './CleaveDirective'
import { VueConstructor } from 'vue'

const plugin = {
  install(Vue: VueConstructor): void {
    Vue.directive('cleave', CleaveDirectiveOpt)
  }
}

export default plugin
