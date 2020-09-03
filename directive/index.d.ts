import CleaveDirective from './CleaveDirective'
import Cleave from './Cleave'

export interface CleaveElement extends HTMLElement {
  cleave?: Cleave
  value?: string
  type?: string
  selectionEnd?: number | null
  name?: string
}

export interface CleaveNode extends Node {
  cleave?: Cleave
  value?: string
  type?: string
  id?: string
  selectionEnd?: number
  name?: string
}

export default CleaveDirective
