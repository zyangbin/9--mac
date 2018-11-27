import Vue from 'vue'
import $ from 'jquery'
import { DOMController } from '../class/DOMController'
Vue.directive('close', {
    bind:(el, binding)=>{
        let targetElement = binding.arg
        el.onclick = ()=>{
            $('.' + targetElement).hide()
        }
    }
})
Vue.directive('move', {
    bind:(el, binding)=>{
        el.onmousedown = (ev)=>{
            ev.preventDefault()
        }
    }
})
Vue.directive('stop', {
    bind:(el, binding)=>{
        el.onclick = (ev)=>{
            ev.stopPropagation()
        }
    }
})
Vue.directive('nickname-portrait', {
    bind:(el, binding)=>{
        let text = el.innerHTML
        el.innerHTML = text.toUpperCase()
    }
})