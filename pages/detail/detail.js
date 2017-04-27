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
    
		eventId: "1",
		isShowBottom:true,
		isOnReachBottom: true,//是否显示底部详情
		description:{
			data:{
				paragraphs:[
				  {
				  	type:1,
				  	value:"这是一段文字"
				  },
				  {
				  	type:2,
				  	value:"http://img06.tooopen.com/images/20160818/tooopen_sy_175866434296.jpg"
				  }
				]
			}
		},
		detail: {
			eventName: "", //事件名称
			startTime: "",
			endTime: "",
			address: "",
			formatedMonth: '',
			//评论数据
			commentData: {
				totalCount:'',
				hasMore:true,
				size:'',
				offset:0,
				commentsList:[]
			},
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
			enrollModuleId:"",
			enrollData:{
				resultData:{
					data:{
						hasEnrolled:true,//当前用户是否报名
					}
					
				}
			},
		},

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
		
		
		//获取事件详情
		wx.request({
			url: APIS.GET_EVENT_BASE,
			data: getEventBaseParams,
			method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
			success: function(res) {
				// success
				var datas=res.data.resultData;
				var en = parseInt(datas.startTime.substring(5, 7));
				that.setData({
						"modules":datas.modules,
						"detail.eventName": datas.name,
						"detail.address": datas.address,
						"detail.formatedMonth": monthFormatList[en].simpleEng,
						"detail.startTime": { //开始时间
							"year": datas.startTime.substring(0, 4), //年份
							"month": datas.startTime.substring(5, 7),
							"day": datas.startTime.substring(8, 10),
							"hours": datas.startTime.substring(11, 16)
						},
						"detail.endTime": { //结束时间
							"year": datas.endTime.substring(0, 4), //年份
							"month": datas.endTime.substring(5, 7),
							"day": datas.endTime.substring(8, 10),
							"hours": datas.endTime.substring(11, 16)
						},
						"pictureUrls" :datas.pictureUrls,
						"detail.isFollow": datas.isFollow, //是否关注了事件，默认false
						"detail.isStar": datas.isStar, //是否点赞了
						"detail.starCount": datas.starCount //点赞总数，默认0
				});
				//设置导航条标题
				/*wx.setNavigationBarTitle({
				  title: datas.eventName
				})*/
				//获取报名模块数据
				that.getEnrollModuleData();
				wx.hideLoading();
				
			}
		});
		
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
				wx.request({
					url: APIS.GET_ENROLL_MODULE,
					data: getEnrollModuleParams,
					method: 'POST',
					success: function(res) {
						that.setData({
							"detail.enrollData": res.data,
							"enrollModuleId": that.data.modules[i].moduleId //把moduleId保存，报名的时候用到
						});
						console.log("获取报名模块数据！",that.data.detail);
					}
				})
				break;
			}
		}
		
	},
	//参加点击报名
	clickEnrollBtn: function(e) {
		console.log("参加", this.data.modules);
		let that = this;
		let isAllow = that.data.detail.enrollData.config.isAllowEnroll;
		let isEnrolled = that.data.detail.enrollData.resultData.data.hasEnrolled;
		//如果该用户允许报名
		const addEnrollParams = {
			sid: wx.getStorageSync('sid') || '',
			moduleId:that.data.enrollModuleId
		};
		
		if(isAllow && !isEnrolled){
			wx.request({
				url: APIS.ADD_ENROLL,
				data: addEnrollParams,
				method: 'POST', 
				success: function(res) {
					
					wx.showToast({
		              title: res.data.resultMsg,
		              icon: 'success',
		              duration: 2000,
		          	});
		          that.setData({
						"detail.enrollData.resultData.data.hasEnrolled": !isEnrolled
					});
				}
			})
		}else{
			wx.showToast({
              title: "您已经报名或者你没有权限",
              icon: 'success',
              duration: 2000,
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
		
		if(that.data.detail.isFollow){
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
						"detail.isFollow": !that.data.detail.isFollow
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
						"detail.isFollow": !that.data.detail.isFollow
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
					"detail.starCount": res.data.resultData.starCount
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
							"detail.commentData": res.data.resultData.data
						});
						console.log(that.data.detail);
						// success
					}
				})
				break;
			}
		}
	},

	onReady: function(e) {},
	//页面展示
	onShow: function() {
		this.getCommentData();
	},
	onHide: function() {
		// 生命周期函数--监听页面隐藏
		console.log('onHide')
	},
	onUnload: function() {
		// 生命周期函数--监听页面卸载
		console.log('onUnload')
	},
	onPullDownRefresh: function() {
		// 页面相关事件处理函数--监听用户下拉动作
		console.log('onPullDownRefresh')
	},
	onReachBottom: function() {
		// 页面上拉触底事件的处理函数,滚动到底部获取事件详情模块
		console.log('onReachBottom');
		let that = this;
		if(that.data.isOnReachBottom){//true
			let mL = that.data.modules.length;
			that.setData({
				"isOnReachBottom":false,
				"isShowBottom":false
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
								"description":res.data.resultData
							});
						}
					})
					break;
				}
			}
		}
		
	},
	//点击分享
	clickShareBtn:function(e){
		console.log("分享",e);
		wx.showShareMenu();
	},
	onShareAppMessage: function() {
		// 用户点击右上角分享
		console.log('onShareAppMessage')
		return {
			desc: '分享给大家看看吧', // 分享描述
			path: '/detail/detail?eventId='+this.data.eventId+'?eventName='+this.data.detail.eventName // 分享路径
		}
	}
})