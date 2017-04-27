//personCenter.js
var {
	APIS
} = require('../../const');
var user = require('../../libs/user');

var { request } = require('../../libs/request');
var { validate } = require('../../libs/validate');
Page({
	data: {
		items: [{
			name: 'teacher',
			value: '老师'
		}, {
			name: 'stu',
			value: '学生',
			checked: 'true'
		}, {
			name: 'schollF',
			value: '校友'
		}, {
			name: 'un_schollF',
			value: '非校友'
		}],
		realName: "",
		phone: "", //昵称
		email: "",
		code: "",
		roleId: "stu",
		tips:"",
		isHideT:true,

		plain: false,
		disabled: false,
		loading: false
	},
	onLoad: function() {
		
	},
	//单选框
	radioChange: function(e) {
		console.log('携带value值为：', e.detail.value);
		this.setData({
			roleId: e.detail.value
		})
	},
	
	verfyPhone: function(phone){
		var that = this;
		var corr_phone = validate.phone(phone);
		if(!corr_phone){
			 that.setData({
			    tips:"输入11位有效的数字！",
			    isHideT:!that.data.isHideT
			   });
			/*setTimeout(function() {
			   that.setData({
			    isHideT:!that.data.isHideT
			   })
		  }, 3000);*/
           return false;
		}
		return true;
	},
	
	verfyEmail: function(email){
		var that = this;
		var corr_email = validate.email(email);
		if(!corr_email){
			 that.setData({
			    tips:"正确邮箱地址！",
			    isHideT:!that.data.isHideT
			   })
			setTimeout(function() {
			   that.setData({
			    isHideT:!that.data.isHideT
			   })
		  }, 3000)
           return false;
		}
		return true;
	},

	formSubmit: function(e) {
		console.log('form发生了submit事件，携带数据为：', e.detail.value)
		var that = this;
		var params = {
			sid: wx.getStorageSync('sid'),
			data: {
				phone: e.detail.value.phone,
				code: e.detail.value.code,
				email: e.detail.value.email,
				roleId: that.data.roleId,
				realName: e.detail.value.realName,
			}
		};
		if(this.verfyPhone(e.detail.value.phone) && this.verfyEmail(e.detail.value.email)){
			request({
				url: APIS.CERTIFICATION,
				data: params,
				method: 'POST',
				realSuccess: function(data) {
					console.log(res);
				},
				realFail: function(msg) {
					wx.hideLoading();
					wx.showToast({
						title: msg
					});
				}
			}, false);
		}
	}
})