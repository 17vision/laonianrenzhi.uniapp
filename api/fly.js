import {
	Request,
	BaseURL,
	Header
} from './request.js';

const UploadFile = (data) => {
	return new Promise((resolve, reject) => {
		const types = {
			image: 'images',
			video: 'videos'
		};

		let url = BaseURL + `/api/oss/files`;
		console.log(data.filePath);
		uni.uploadFile({
			url: url,
			filePath: data.filePath,
			name: 'file', 
			header: Header(),
			formData: data.formData || {},
			success: (res) => {
				try {
					if (res.statusCode === 200) {
						let result = typeof res.data === 'object' ?
							res.data :
							JSON.parse(res.data);
						resolve(result); // ✅ 返回成功
					} else {
						reject(res.statusCode);
					}
				} catch (e) {
					reject(e);
				}
			},
			fail: (err) => {
				reject(err);
			},
			complete: () => {
				if (data.complete) data.complete();
			}
		});
	});
};



// 获取自己的信息
const GetUserinfo = (data) => {
	return Request('get', '/api/user-info', data);
}


// 小程序登录注册
const WxMiniLogin = (data) => {
	return Request('post', '/api/wxmini-login', data);
}


// 上传 base64 图片
const UploadImages = (data) => {
	return Request('post', '/api/images', data);
}
const OssImages = (data) => {
	return Request('post', '/api/oss/files', data);
}


export {
	UploadFile,
	GetUserinfo,
	WxMiniLogin,
	UploadImages,
	OssImages
}