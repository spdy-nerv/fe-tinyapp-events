//personCenter.js
var { APIS } = require('../../const');
var user = require('../../libs/user');
var { request } = require('../../libs/request');
var { validate } = require('../../libs/validate');
Page({
  data: {
  	footerConfig: {
      pagePersonal: true
    },
    realName:"",  
	  photo:"",   
	  phone:"",   
	  email:"",
	  degree:"",
	  school :"",
	  hobbies:[
	  	"篮球",
      "麻将"
	  ],
	  declaration:''
  },
  onLoad: function () {
  	console.log("onLoad");
  	wx.showLoading({
	      mask: true,
	      title: '数据加载中'
	    });
	    user.login(this.onLoadData(), this, true);
	    
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
      	console.log("pic",data);
      	that.setData({
        	realName:	data.realName,
        	photo:		data.photo,
        	phone: 		data.phone,
        	email:		data.email,
        	degree:		data.degree,
        	school:		data.school,
        	hobbies:	data.hobbies,
        	declaration: data.declaration
        });
        console.log(that.data.photo);
        wx.hideLoading();
      },
      realFail: function(msg) {
        wx.hideLoading();
        wx.showToast({
          title: msg
        });
      }
    }, false);
  },
  
  clickClose: function(e){
  	var cid = e.currentTarget.dataset.id;
    this.data.hobbies.splice(cid,1);
  	this.setData({
  		hobbies:this.data.hobbies
  	});
  },
  
  chooseimage: function () {  
    var that = this;  
    wx.chooseImage({
      count: 1, // 默认9  
		  success: function(resp) {
			    var tempFilePaths = resp.tempFilePaths;
			    wx.showToast({
				    icon: "loading",
				    title: "正在上传"
				  }),
			    wx.uploadFile({
			      url: APIS.FILE_UPLOAD,
			      filePath: tempFilePaths[0],
			      header: { "Content-Type": "multipart/form-data" },
			      name: 'file',
			      success: function(res){
			        var img = JSON.parse(res.data).resultData.imgUrl;
				       console.log(img);
				       that.setData({
				        	photo:img
				        });
				        wx.showToast({
							    icon: "success",
							    title: "上传成功！！"
							  });
							  console.log("上传后",that.data.photo);
			       if (res.statusCode != 200) {
			          wx.showModal({
			            title: '提示',
			            content: '上传失败',
			            showCancel: false
			          })
			          return;
			        }
			        /*_this.setData({  
			          photo:res.tempFilePaths  
			        })*/
			      }
			    })
			  }
		})
  },
  
  formSubmit: function(e) {
		var that = this;
		var params = {
			sid: wx.getStorageSync('sid'),
			data: {
				realName: e.detail.value.realName,
				photo: that.data.photo,
				phone: e.detail.value.phone,
				email: e.detail.value.email,
				degree: e.detail.value.degree,
				school: e.detail.value.school,
				hobbies: wx.getStorageSync("hobbies") || that.data.hobbies,
				declaration: wx.getStorageSync("declaration") || that.data.declaration
			}
		};
		console.log("提交的数据",params);
		var corr_email = validate.email(e.detail.value.email);
		var corr_phone = validate.phone(e.detail.value.phone);
		
		if(!corr_phone){
			wx.showToast({
			  title: '请输入正确手机号码'
			})
			return;
		}
		if(!corr_email){
			wx.showToast({
			  title: '请输入正确邮箱地址'
			})
			return;
		}
		request({
			url: APIS.EDIT_CARD,
			data: params,
			method: 'POST',
			realSuccess: function(res) {
				wx.showToast({
          title: "修改成功！",
          icon: 'success',
          duration: 2000,
      	});
      	wx.removeStorageSync('declaration');
      	wx.removeStorageSync('hobbies');
			},
			realFail: function(msg) {
				wx.showToast({
					title: msg
				});
			}
		}, false);
	}
})
