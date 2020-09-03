// import CleaveDirective from './index'
import Cleave from './Cleave'

export interface CleaveElement extends HTMLElement {
  cleave?: typeof Cleave
  value?: string
  type?: string
  selectionEnd?: number | null
  name?: string
}

export interface CleaveNode extends Node {
  cleave?: typeof Cleave
  value?: string
  type?: string
  id?: string
  selectionEnd?: number
  name?: string
}

export default CleaveDirective
