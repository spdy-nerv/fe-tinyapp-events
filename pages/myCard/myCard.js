//personCenter.js
var { APIS } = require('../../const');
var user = require('../../libs/user');
var { request } = require('../../libs/request');
Page({
  data: {
    realName:"",  
	  photo:"",   
	  phone:"",   
	  email:"",
	  degree:"",
	  school :"",
	  hobbies:[
	  	"篮球",
      "麻将"
	  ] 
  },
  onLoad: function () {
  	wx.showLoading({
	      mask: true,
	      title: '数据加载中'
	    });
	    user.login(this.onLoadData, this, true);
  },
  onLoadData: function(){
  	var that = this;
  	var params = {
  		sid: wx.getStorageSync('sid')
  	};
  	 request({
      url: APIS.MY_CARD,
      data: params,
      method: 'POST',
      realSuccess: function(data){
      	that.setData({
        	realName:	data.realName,
        	photo:		data.photo,
        	phone: 		data.phone,
        	email:		data.email,
        	degree:		data.degree,
        	school:		data.school,
        	hobbies:	data.hobbies
        });
        wx.hideLoading();
      },
      realFail: function(msg) {
        wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, false);
  }
})
