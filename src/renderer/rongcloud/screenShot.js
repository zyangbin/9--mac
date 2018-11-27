 var screenshot = RongDesktop.require('Screenshot');
 var completeCallback = function(file,callback){
    //  console.log('file2222')
    //  console.log(file)
     callback
 }
 
 var cancelCallback = function(){
    //  console.log('exit screenshot');
    //  alert('exit screenshot');
 }
 
 function startShot(isHideWindow){
     screenshot.capture({
         complete: completeCallback,
         cancel: cancelCallback,
         isHideWindow: isHideWindow
     });
 }
 function setShortcut(key){
     var Shortcut = RongDesktop.require('Shortcut');
     Shortcut.set(key, function() {
         startShot();
     });
 }
 export default {
    startShot,
    setShortcut,
    cancelCallback,
    completeCallback
 }