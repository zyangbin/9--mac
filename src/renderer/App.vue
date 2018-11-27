<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
  import { ipcRenderer } from 'electron'
  export default {
    name: 'vue-electron',

    mounted(){
        $('img').bind('onmousemove',(ev)=>{
            ev.preventDefault()
        })
        ipcRenderer.on('app-quit',(ev,str)=>{
            if(str=='quit'){
                if(window.$websocket){
                    window.$websocket.close()
                }
                ipcRenderer.send('quit-app','quit')
            }
        })
    }
  }
</script>

<style>
    html,body{
        width:100%;height:100%;margin:0px;
    }
    html, body, div, ul, li, h1, h2, h3, h4, h5, 
    h6, p, dl, dt, dd, ol, form, input, span:not(.special), a,
    textarea, th, td, select,button {font-family:
        "Microsoft YaHei", 
        "Arial", 
        "Helvetica", 
        "sans-serif",
        "SimSun";
    }
    *{
          margin:0;padding:0;
    }
    #app{
        box-sizing:border-box;
        width:100%;height:100%;overflow: hidden;
        /* border:1px solid #ddd; */
        /* border-radius:10px; */
        /* box-shadow: 2px 2px 22px red; */

    }
    .fl{
        float:left;
    }
    .fr{
        float:right;
    }
    .clearfix:after {
        content: " ";
        display: block;;
        line-height: 0;
        height: 0;
        visibility: hidden;
        clear: both;
    }
    .ellipsis{
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
    }
</style>
