import Vue from 'vue'

export function formatPortraitColor(userid){
    Vue.filter('formatPortraitColor',(userid)=>{
        var colors = ["#e97ffb", "#00b8d4", "#82b2ff", "#f3db73", "#f0857c"];
		var i = 0;
		// var userid = userid; //"eb2e47b0a69e11e8914000163e0afdd9";

	    if (!userid) {
	        return colors[0];
	    }else{

	    	var str = "wu" + userid + "ye";

	    	// console.log(md5(str)[0]);
	    	// console.log(md5(str)[0].charCodeAt());

	    	var mdstr = md5(str)[0];
	    	mdstr = mdstr ? mdstr : "";
	    	if(mdstr)
	    		i = mdstr.toUpperCase().charCodeAt() % 5;

	    }
	      
	    return colors[i];
        // const colorArr = ["#e97ffb", "#00b8d4", "#82b2ff", "#f3db73", "#f0857c"]
        // let idx = Math.floor(Math.random()*5)
        // return colorArr[idx]
    })
}