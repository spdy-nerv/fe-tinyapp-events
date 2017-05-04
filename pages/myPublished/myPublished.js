//myFollows .js
var { APIS } = require('../../const');
var user = require('../../libs/user');
var { request } = require('../../libs/request');
Page({
  data: {
		footerConfig: { 
      pagePersonal: true
    },
  	isNoData:"",
  	list:[]
		 //status:'0' //0审核中 1 已发布 2未通过 3已完成
  },
  onLoad: function () {
  	wx.showLoading({
	      mask: true,
	      title: '数据加载中'
	    });
	    user.login(this.onLoadData, this, false);
  },
  onLoadData: function(){
  	var that = this;
  	var params = {
  		sid: wx.getStorageSync('sid'),
  		offset:0,
			size:20
  	};
  	 request({
      url: APIS.MY_PUBLISHED,
      data: params,
      method: 'POST',
      realSuccess: function(data){
      	console.log("我的发布",data);
      	that.setData({
      		list:data.list
      	});
      	if(data.list.length==0){
      		that.setData({
	      		isNoData:"暂时没有发布任何事件！"
	      	});
      	}
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
