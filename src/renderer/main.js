
import _ from 'lodash'
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from 'axios'
import store from './store/store'
import ElementUi from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import './filters'
import './directives'
// Vue.use(directive)
import $ from 'jquery'
window.jQuery = $
import Win from 'electron-vue-windows'
Win.init()
Vue.prototype.$Win = Win

window.$ = $
window.uploadTargetId = 0
Vue.config.productionTip = false

if(process.env.NODE_ENV=='development'){
    Vue.prototype.ajaxUrl = '/weinong'
}else{
    // Vue.prototype.ajaxUrl = 'http://chattest.weinongtech.com'
    Vue.prototype.ajaxUrl = 'http://chat.weinongtech.com'
}
 
Vue.prototype.axios = axios
Vue.use(ElementUi)
new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>',
    store
})


