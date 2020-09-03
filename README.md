# vue2-cleavejs-directive

## install

```
yarn add https://github.com/mrchoke/vue2-cleavejs-directive
```

## global 

```js
import Vue from 'vue'
import App from './App.vue'
import CleaveDirective from '@vue2/cleavejs-directive'
Vue.config.productionTip = false
Vue.use(CleaveDirective)
new Vue({
  render: h => h(App)
}).$mount('#app')
```

### Credit card

```vue
<input type="text" v-model="input" v-cleave="{ creditCard: true }" />
```

### Thousand

```vue
<input type="text" v-model="input" v-cleave="{ numeral: true, numeralThousandsGroupStyle: 'thousand' }" />
```

### Phone number 

```vue
<input type="text" v-model="input" v-cleave="{ phone: true, delimiter: '-', phoneRegionCode: 'TH'  }" />
```

### Date

```vue
<input type="text" v-model="input" v-cleave="{ date: true, delimiter: '/', datePattern: ['d', 'm', 'Y']  }" />
```

### Time

```vue
<input type="text" v-model="input" v-cleave="{ time: true, datePattern: ['h', 'm', 's']  }" />
```

### Custom (Thai National ID card)

```vue
<input type="text" v-model="input" v-cleave="{ numericOnly: true, delimiter: '-', blocks: [1, 4, 5, 2, 1]}" />
```

### Prefix

```vue
<input type="text" v-model="input" v-cleave="{  prefix: 'VUEJS', delimiter: '-', blocks: [5, 3, 3, 3], uppercase: true}" />
```

## More Info

[cleavejs](https://nosir.github.io/cleave.js)

