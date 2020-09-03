import 'cleave.js/dist/addons/cleave-phone.i18n'

import { CleaveElement, CleaveNode } from '../src/types'
import { CleaveOptions } from 'cleave.js/options'
const Util = require('cleave.js/src/utils/Util')
const DefaultProperties = require('cleave.js/src/common/DefaultProperties')
const TimeFormatter = require('cleave.js/src/shortcuts/TimeFormatter')
const DateFormatter = require('cleave.js/src/shortcuts/DateFormatter')
const PhoneFormatter = require('cleave.js/src/shortcuts/PhoneFormatter')
const CreditCardDetector = require('cleave.js/src/shortcuts/CreditCardDetector')
const NumeralFormatter = require('cleave.js/src/shortcuts/NumeralFormatter')

export default class Cleave {
  element: CleaveElement | CleaveNode
  elementSwapHidden: CleaveElement | CleaveNode
  options: CleaveOptions
  ev: Event
  isAndroid: boolean
  lastInputValue: string | undefined
  isBackward: boolean
  properties: typeof DefaultProperties
  onChangeListener: (e: Event) => void
  onKeyDownListener: (e: Event) => void
  onFocusListener: (e: Event) => void
  onCutListener: (e: Event) => void
  onCopyListener: (e: Event) => void

  constructor(el: CleaveElement, options: CleaveOptions = {}) {
    this.element = this.getInput(el)
    this.elementSwapHidden = {} as CleaveNode
    this.options = options
    this.ev = new Event('input', { bubbles: true })
    this.isAndroid = Util.isAndroid()
    this.lastInputValue = ''
    this.isBackward = false

    this.properties = DefaultProperties.assign({}, this.options)
    this.properties.initValue = this.element.value

    this.properties.maxLength = Util.getMaxLength(this.properties.blocks)
    this.onChangeListener = this.onChange.bind(this) as EventListener
    this.onKeyDownListener = this.onKeyDown.bind(this) as EventListener
    this.onFocusListener = this.onFocus.bind(this)
    this.onCutListener = this.onCut.bind(this) as EventListener
    this.onCopyListener = this.onCopy.bind(this) as EventListener
    this.initSwapHiddenInput()
    this.element.addEventListener('input', this.onChangeListener)
    this.element.addEventListener('keydown', this.onKeyDownListener)
    this.element.addEventListener('focus', this.onFocusListener)
    this.element.addEventListener('cut', this.onCutListener)
    this.element.addEventListener('copy', this.onCopyListener)

    this.initPhoneFormatter()
    this.initDateFormatter()
    this.initTimeFormatter()
    this.initNumeralFormatter()

    if (
      !this.properties.numeral &&
      !this.properties.phone &&
      !this.properties.creditCard &&
      !this.properties.time &&
      !this.properties.date &&
      this.properties.blocksLength === 0 &&
      !this.properties.prefix
    ) {
      this.onInput(this.properties.initValue)

      return
    }

    if (this.properties.initValue || (this.properties.prefix && !this.properties.noImmediatePrefix)) {
      this.onInput(this.properties.initValue)
    }
  }

  getInput(el: CleaveElement) {
    if (el.tagName.toLocaleUpperCase() !== 'INPUT') {
      const els = el.getElementsByTagName('input')
      if (els.length !== 1) {
        throw new Error(`v-cleave requires 1 input, found ${els.length}`)
      } else {
        el = els[0]
      }
    }
    return el
  }
  initSwapHiddenInput() {
    if (!this.properties.swapHiddenInput) return

    const inputFormatter = this.element.cloneNode(true)
    this.element.parentNode?.insertBefore(inputFormatter, this.element)

    this.elementSwapHidden = this.element
    this.elementSwapHidden.type = 'hidden'

    this.element = inputFormatter
    this.element.id = ''
  }

  initTimeFormatter() {
    if (!this.properties.time) {
      return
    }

    this.properties.timeFormatter = new TimeFormatter(this.properties.timePattern, this.properties.timeFormat)
    this.properties.blocks = this.properties.timeFormatter.getBlocks()
    this.properties.blocksLength = this.properties.blocks.length
    this.properties.maxLength = Util.getMaxLength(this.properties.blocks)
  }

  initDateFormatter() {
    if (!this.properties.date) {
      return
    }

    this.properties.dateFormatter = new DateFormatter(this.properties.datePattern, this.properties.dateMin, this.properties.dateMax)
    this.properties.blocks = this.properties.dateFormatter.getBlocks()
    this.properties.blocksLength = this.properties.blocks.length
    this.properties.maxLength = Util.getMaxLength(this.properties.blocks)
  }

  initPhoneFormatter() {
    if (!this.properties.phone) {
      return
    }

    // Cleave.AsYouTypeFormatter should be provided by
    // external google closure lib
    try {
      this.properties.phoneFormatter = new PhoneFormatter(
        new this.properties.root.Cleave.AsYouTypeFormatter(this.properties.phoneRegionCode),
        this.properties.delimiter
      )
    } catch (ex) {
      throw new Error('[cleave.js] Please include phone-type-formatter.{country}.js lib')
    }
  }

  setRawValue(value: string) {
    value = value !== undefined && value !== null ? value.toString() : ''

    if (this.properties.numeral) {
      value = value.replace('.', this.properties.numeralDecimalMark)
    }

    this.properties.postDelimiterBackspace = false

    this.element.value = value
    this.onInput(value)
  }

  getRawValue() {
    let rawValue = this.element.value

    if (this.properties.rawValueTrimPrefix) {
      rawValue = Util.getPrefixStrippedValue(
        rawValue,
        this.properties.prefix,
        this.properties.prefixLength,
        this.properties.result,
        this.properties.delimiter,
        this.properties.delimiters,
        this.properties.noImmediatePrefix,
        this.properties.tailPrefix,
        this.properties.signBeforePrefix
      )
    }

    if (this.properties.numeral) {
      rawValue = this.properties.numeralFormatter.getRawValue(rawValue)
    } else {
      rawValue = Util.stripDelimiters(rawValue, this.properties.delimiter, this.properties.delimiters)
    }

    return rawValue
  }

  updateValueState() {
    if (!this.element) {
      return
    }

    let endPos = this.element.selectionEnd
    const oldValue = this.element.value
    const newValue = this.properties.result

    endPos = Util.getNextCursorPosition(endPos, oldValue, newValue, this.properties.delimiter, this.properties.delimiters)

    // fix Android browser type="text" input field
    // cursor not jumping issue
    /*  if (this.isAndroid) {
      window.setTimeout(function() {
        this.element.value = newValue
        Util.setSelection(this.element, endPos, this.properties.document, false)
        this.callOnValueChanged()
      }, 1)
      try {
        this.element.dispatchEvent(this.ev)
        // console.table(this.ev)
      } catch {
        //
      }
      return
    } */

    this.element.value = newValue
    // console.log(this.element.value)

    if (this.properties.swapHiddenInput) this.elementSwapHidden.value = this.getRawValue()

    Util.setSelection(this.element, endPos, this.properties.document, false)
    this.callOnValueChanged()
    try {
      this.element.dispatchEvent(this.ev)
      // console.table(this.ev)
    } catch {
      //
    }
  }

  callOnValueChanged() {
    this.properties.onValueChanged.call(this, {
      target: {
        name: this.element.name,
        value: this.properties.result,
        rawValue: this.getRawValue()
      }
    })
  }

  copyClipboardData(e: ClipboardEvent) {
    const inputValue = this.element.value
    let textToCopy: string | undefined = ''

    if (!this.properties.copyDelimiter) {
      textToCopy = Util.stripDelimiters(inputValue, this.properties.delimiter, this.properties.delimiters)
    } else {
      textToCopy = inputValue
    }

    try {
      if (e.clipboardData) {
        e.clipboardData.setData('Text', textToCopy || '')
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(window as any).clibboardData.setData('Text', textToCopy)
      }

      e.preventDefault()
    } catch (er) {
      //  empty
    }
  }

  onKeyDown(event: KeyboardEvent) {
    const charCode = event.which || event.keyCode

    this.lastInputValue = this.element.value || ''
    this.isBackward = charCode === 8
  }

  onChange(event: InputEvent) {
    this.isBackward = this.isBackward || event.inputType === 'deleteContentBackward'

    const postDelimiter = Util.getPostDelimiter(this.lastInputValue, this.properties.delimiter, this.properties.delimiters)

    if (this.isBackward && postDelimiter) {
      this.properties.postDelimiterBackspace = postDelimiter
    } else {
      this.properties.postDelimiterBackspace = false
    }

    this.onInput(this.element.value || '')
  }

  onFocus() {
    this.lastInputValue = this.element.value

    if (this.properties.prefix && this.properties.noImmediatePrefix && !this.element.value) {
      this.onInput(this.properties.prefix)
    }

    Util.fixPrefixCursor(this.element, this.properties.prefix, this.properties.delimiter, this.properties.delimiters)
  }

  onCut(e: ClipboardEvent) {
    if (!Util.checkFullSelection(this.element.value)) return
    this.copyClipboardData(e)
    this.onInput('')
  }

  onCopy(e: ClipboardEvent) {
    if (!Util.checkFullSelection(this.element.value)) return
    this.copyClipboardData(e)
  }

  onInput(value: string) {
    const postDelimiterAfter = Util.getPostDelimiter(value, this.properties.delimiter, this.properties.delimiters)
    if (!this.properties.numeral && this.properties.postDelimiterBackspace && !postDelimiterAfter) {
      value = Util.headStr(value, value.length - this.properties.postDelimiterBackspace.length)
    }
    // phone formatter
    if (this.properties.phone) {
      if (this.properties.prefix && (!this.properties.noImmediatePrefix || value.length)) {
        this.properties.result = this.properties.prefix + this.properties.phoneFormatter.format(value).slice(this.properties.prefix.length)
      } else {
        this.properties.result = this.properties.phoneFormatter.format(value)
      }
      this.updateValueState()

      return
    }

    if (this.properties.numeral) {
      if (this.properties.prefix && this.properties.noImmediatePrefix && value.length === 0) {
        this.properties.result = ''
      } else {
        this.properties.result = this.properties.numeralFormatter.format(value)
      }
      this.updateValueState()
      return
    }

    // date
    if (this.properties.date) {
      value = this.properties.dateFormatter.getValidatedDate(value)
    }

    // time
    if (this.properties.time) {
      value = this.properties.timeFormatter.getValidatedTime(value)
    }

    value = Util.stripDelimiters(value, this.properties.delimiter, this.properties.delimiters)

    // strip prefix
    value = Util.getPrefixStrippedValue(
      value,
      this.properties.prefix,
      this.properties.prefixLength,
      this.properties.result,
      this.properties.delimiter,
      this.properties.delimiters,
      this.properties.noImmediatePrefix,
      this.properties.tailPrefix,
      this.properties.signBeforePrefix
    )

    // strip non-numeric characters
    value = this.properties.numericOnly ? Util.strip(value, /[^\d]/g) : value

    // convert case
    value = this.properties.uppercase ? value.toUpperCase() : value
    value = this.properties.lowercase ? value.toLowerCase() : value

    // prevent from showing prefix when no immediate option enabled with empty input value
    if (this.properties.prefix) {
      if (this.properties.tailPrefix) {
        value = value + this.properties.prefix
      } else {
        value = this.properties.prefix + value
      }

      // no blocks specified, no need to do formatting
      if (this.properties.blocksLength === 0) {
        this.properties.result = value
        this.updateValueState()

        return
      }
    }

    if (this.properties.creditCard) {
      this.updateCreditCardPropsByValue(value)
    }

    // strip over length characters
    value = Util.headStr(value, this.properties.maxLength)

    // apply blocks
    this.properties.result = Util.getFormattedValue(
      value,
      this.properties.blocks,
      this.properties.blocksLength,
      this.properties.delimiter,
      this.properties.delimiters,
      this.properties.delimiterLazyShow
    )

    this.updateValueState()
  }

  updateCreditCardPropsByValue(value: string) {
    // At least one of the first 4 characters has changed
    if (Util.headStr(this.properties.result, 4) === Util.headStr(value, 4)) {
      return
    }

    const creditCardInfo = CreditCardDetector.getInfo(value, this.properties.creditCardStrictMode)

    this.properties.blocks = creditCardInfo.blocks
    this.properties.blocksLength = this.properties.blocks.length
    this.properties.maxLength = Util.getMaxLength(this.properties.blocks)

    // credit card type changed
    if (this.properties.creditCardType !== creditCardInfo.type) {
      this.properties.creditCardType = creditCardInfo.type

      this.properties.onCreditCardTypeChanged.call(this, this.properties.creditCardType)
    }
  }

  initNumeralFormatter() {
    if (!this.properties.numeral) {
      return
    }

    this.properties.numeralFormatter = new NumeralFormatter(
      this.properties.numeralDecimalMark,
      this.properties.numeralIntegerScale,
      this.properties.numeralDecimalScale,
      this.properties.numeralThousandsGroupStyle,
      this.properties.numeralPositiveOnly,
      this.properties.stripLeadingZeroes,
      this.properties.prefix,
      this.properties.signBeforePrefix,
      this.properties.tailPrefix,
      this.properties.delimiter
    )
  }
}
