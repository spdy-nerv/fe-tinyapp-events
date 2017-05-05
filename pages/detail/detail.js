//detail.js
//获取应用实例
/*var app = getApp()*/


var { monthFormatList, dayFormatList, APIS } = require('../../const');
var util = require('../../utils/util');
var user = require('../../libs/user');
var { request } = require('../../libs/request');

Page({
	data: {
		pictureUrls: [],  //事情图片
	    indicatorDots: true,  
	    autoplay: true,  
	    interval: 5000,  
	    duration: 1000,
    
		eventId: "",
		
		des:{
			isShowBottom:true,
			description:'',
			//评论数据
			commentData: {},
			createAt:'',
			isAllowComment:true
		},
		
		eventName: "", //事件名称
		startTime: "",
		endTime: "",
		address: "",
		formatedMonth: '',
		
		startTime: { //开始时间
			year: "", //年份
			month: "",
			day: "",
			hours:"23"
		},
		endTime: { //开始时间
			year: "", //年份
			month: "",
			day: "",
			hours:"23"
		},
		isFollow: false, //是否关注了事件，默认false
		isStar: false, //是否点赞了
		starCount: 0, //点赞总数，默认0
		isAllow:true,
		hasEnrolled:false,
		enrollModuleId:"",
		isShowEnroll:false,//是否有参加模块
		enrollData:{},
		latitude:'',
		longitude:'',
		isShowShare:true,

		//模块Id, moduleType 1:详情事件，2:评论，3：报名，4：投票，5:问卷，6：评价
		modules: []
	},

	onLoad: function(options){
		
		this.setData({
			eventId:options.eventId
		});
		
		wx.showLoading({
	      mask: true,
	      title: '数据加载中'
	    });
	    user.login(this.onLoadData, this, true);
	    
	},
	//页面加载的函数
	onLoadData: function() {
		const that = this;
		const getEventBaseParams = {
			sid: wx.getStorageSync('sid') || '',
			eventId: that.data.eventId
		};
		
		request({
	      url: APIS.GET_EVENT_BASE,
	      data: getEventBaseParams,
	      method: 'POST',
	      realSuccess: function(data){
	      		console.log("base",data);
	        	var datas=data;
				var en = parseInt(datas.startTime.substring(5, 7));
				that.setData({
						"modules":datas.modules,
						"eventName": datas.name,
						"address": datas.address,
						"formatedMonth": monthFormatList[en-1].simpleEng,
						"startTime": { //开始时间
							"year": datas.startTime.substring(0, 4), //年份
							"month": datas.startTime.substring(5, 7),
							"day": datas.startTime.substring(8, 10),
							"hours": datas.startTime.substring(11, 16)
						},
						"endTime": { //结束时间
							"year": datas.endTime.substring(0, 4), //年份
							"month": datas.endTime.substring(5, 7),
							"day": datas.endTime.substring(8, 10),
							"hours": datas.endTime.substring(11, 16)
						},
						"pictureUrls" :datas.pictureUrls,
						"isFollow": datas.isFollow, //是否关注了事件，默认false
						"isStar": datas.isStar, //是否点赞了
						"starCount": datas.starCount, //点赞总数，默认0
						"latitude":datas.latitude,
						"longitude":datas.longitude
				});
				that.getEnrollModuleData();
				that.getCommentData();
	        	wx.hideLoading();
	      },
	      realFail: function(msg) {
	        wx.hideLoading();
	        wx.showToast({
	          title: msg
	        });
	      }
	    }, true);
    
	},

	//获取报名模块数据
	getEnrollModuleData:function(){
		let that = this;
		let mL = that.data.modules.length;
		for(let i=0;i<mL;i++){
			if(that.data.modules[i].moduleType=="3"){
				console.log(that.data.modules[i].moduleId);
				const getEnrollModuleParams = {
					sid: wx.getStorageSync('sid') || '',
					moduleId: that.data.modules[i].moduleId
				};
				
				request({
					url: APIS.GET_ENROLL_MODULE,
					data: getEnrollModuleParams,
					method: 'POST',
					realSuccess: function(res) {
						console.log("bm",res);
						that.setData({
							"hasEnrolled":res.data.hasEnrolled,
							"enrollModuleId": that.data.modules[i].moduleId //把moduleId保存，报名的时候用到
						});
					},
					realFail: function(msg) {
						wx.showToast({
							title: msg
						});
					}
				}, false);
				
				break;
			}
		}
		
	},
	//参加点击报名
	clickEnrollBtn: function(e) {
		let that = this;
		//如果该用户允许报名
		if(that.data.enrollModuleId){
		const addEnrollParams = {
			sid: wx.getStorageSync('sid') || '',
			moduleId:that.data.enrollModuleId
		};
		
		if(that.data.isAllow && !that.data.hasEnrolled){
			wx.request({
					url: APIS.ADD_ENROLL,
					data: addEnrollParams,
					method: 'POST',
					success: function(res) {
						console.log("报名",res);
						wx.showToast({
			              title: res.data.resultMsg,
			              icon: 'success',
			              duration: 2000,
			          	});
			          	if(errCode=='0000'){
				          	that.setData({
				          		"isAllow": !that.data.isAllow,
								"hasEnrolled": !that.data.hasEnrolled
							});
			          	}
					},
				});
				
		}else{
			wx.showToast({
              title: "您已经报名！",
              icon: 'success',
              duration: 2000,
          	});
		}
		}else{
			wx.showToast({
              title: "事件发布者暂时没有开通报名模块！",
          	});
		}
	},
	//点击关注
	clickFollowEventBtn: function(e) {
		console.log("关注", e);
		
		let that = this;
		const followEventParams = {
			sid: wx.getStorageSync('sid') || '',
			eventId: that.data.eventId
		};
		
		if(that.data.isFollow){
			//true 就取消关注
			wx.request({
				url: APIS.UN_FOLLOW_EVENT,
				data: followEventParams,
				method: 'POST', 
				success: function(res) {
					console.log(res);
					wx.showToast({
		              title: res.data.resultMsg,
		              icon: 'success',
		              duration: 2000,
		          	});
		          that.setData({
						"isFollow": !that.data.isFollow
					});
				}
			})
		}else{
			//false 关注
			wx.request({
				url: APIS.FOLLOW_EVENT,
				data: followEventParams,
				method: 'POST', 
				success: function(res) {
					console.log(res);
					wx.showToast({
		              title: res.data.resultMsg,
		              icon: 'success',
		              duration: 2000,
		          	});
		          	that.setData({
						"isFollow": !that.data.isFollow
					});
				}
			})
		}
	},
	//点赞
	clickAddStarBtn: function(e) {
		let that = this;
		const addStarParams = {
			sid: wx.getStorageSync('sid') || '',
			eventId: that.data.eventId
		};
		wx.request({
			url: APIS.ADD_STAR,
			data: addStarParams,
			method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
			// header: {}, // 设置请求的 header
			success: function(res) {
				console.log(res);
				that.setData({
					"starCount": res.data.resultData.starCount,
					"isStar":!that.data.isStar
				});
				// success
			}
		})

	},
	
	//请求评论模块数据
	getCommentData:function(){
		let that = this;
		let mL = that.data.modules.length;
		for(let i=0;i<mL;i++){
			if(that.data.modules[i].moduleType=="2"){
				console.log(that.data.modules[i].moduleId);
				const getCommentModuleParams = {
					sid: wx.getStorageSync('sid') || '',
					size: 20,   
				    offset: 1,
					moduleId: that.data.modules[i].moduleId
				};
				wx.request({
					url: APIS.GET_COMMENT_MODULE,
					data: getCommentModuleParams,
					method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
					// header: {}, // 设置请求的 header
					success: function(res) {
						console.log("获取评论数据！",res);
						that.setData({
							"des.commentData": res.data.resultData,
							"des.isAllowComment":!res.data.resultData.config.isAllowComment
						});
						console.log(that.data.des.commentData);
						// success
					}
				})
				break;
			}
		}
	},
	clickShowInfo: function() {
		let that = this;
		let mL = that.data.modules.length;
		that.setData({
			"des.isShowBottom":!that.data.des.isShowBottom
		});
		for(let i=0;i<mL;i++){
			if(that.data.modules[i].moduleType=="1"){
				const getDescriptionModuleParams = {
					sid: wx.getStorageSync('sid') || '',
					moduleId: that.data.modules[i].moduleId
				};
				wx.request({
					url: APIS.GET_DESCRIPTION_MODULE,
					data: getDescriptionModuleParams,
					method: 'POST',
					success: function(res) {
						console.log("详情！",res);
						that.setData({
							"des.description":res.data.resultData.data
						});
					}
				})
				break;
			}
		}
		
	},
	//点击分享
	clickShareBtn:function(e){
		console.log("分享",e);
		this.setData({
			isShowShare:!this.data.isShowShare
		})
		//wx.showShareMenu();
	},
	hiddenShare:function(e){
		this.setData({
			isShowShare:!this.data.isShowShare
		})
	},
	//页面展示
	onShow: function() {
		this.getCommentData();
	},
	onShareAppMessage: function() {
		// 用户点击右上角分享
		console.log('onShareAppMessage')
		return {
			desc: '分享给大家看看吧', // 分享描述
			path: '/detail/detail?eventId='+this.data.eventId+'&eventName='+this.data.eventName // 分享路径
		}
	}
})