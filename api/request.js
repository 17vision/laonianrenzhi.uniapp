import { md5 } from '@/static/js/md5.js';

import { useUser } from '@/store/user.js';

const BaseURL = "https://joy.joyuai.com";
						
// 获取 token
function GetToken() {
	const token = uni.getStorageSync('token');
	const now = (new Date()).getTime() / 1000;
	if (token && token.expires_at > now) {
		return token.token;
	}
	return null;
}

function SetToken(token, expires_in) {
	const expires_at = parseInt((new Date()).getTime() / 1000) + expires_in
	uni.setStorageSync('token', {
		token,
		expires_at
	})
}

function RemoveToken() {
	uni.removeStorageSync('token')
}

function Header() {
	const secret = "Abc2fZ0Rv8";
	const time = new Date().getTime();
	const token = GetToken();
	return {
		'Authorization': `Bearer ${token}`,
		'Content-Type': 'application/json',
		'Time': time,
		'token': token,
		'primarychannelid': 99999,
		'platform': 'wxmp',
		'Sign': md5(secret + time)
	}
}

function Request(method, url, data, config = {}) {
	const {
		loading = true,
		redirect = true
	} = config;
	
	const urls = ['login/wxmini'];

	if (!urls.includes(url) && loading) {
		uni.showLoading({
			title: '请求中，请稍等…'
		});
	}
	
	if (!data) {
		data = {};
	}
	
	if (method != 'get') {
		data = JSON.stringify(data)
	}
	
	const header = Header();
	return new Promise((resolve, reject) => {
		uni.request({
			url: BaseURL + url,
			data: data,
			header: header,
			method: method.toLocaleUpperCase(),
			timeout: 60000,
			dataType: 'json',
			responseType: 'text',
			sslVerify: false,
			withCredentials: false,
			success: function(res) {
				const statusCode = res.statusCode;
				if (statusCode == 200) {
					if (typeof res.data == 'string') {
						resolve(JSON.parse(res.data));
					} else {
						resolve(res.data);
					}

				} else if (statusCode === 401) {
					const user = useUser();
					if (redirect) {
						uni.navigateTo({
							url: '/pages/login/login'
						})
					}
					user.loginOut()
					reject({
						message: '登录已过期，请重新登录'
					});
				} else {
					reject({
						message: '请求失败，请联系管理员'
					});
				}
			},
			fail: function(err) {
				reject({
					message: '请求失败，请联系管理员'
				});
			},
			complete: function() {
				uni.hideLoading();
			}
		})
	});
}

/**
 * 上传单张图片
 * @param {string} filePath - 本地临时文件路径
 * @param {string} fileName - 自定义文件名（可选）
 */
function UploadImage(filePath, fileName = '') {
  return new Promise((resolve, reject) => {
    const defaultName = filePath.split('/').pop() || 'image.png';
    const finalFileName = fileName || defaultName;
    
    uni.uploadFile({
      url: BaseURL + '/jtour-yjy-client/upload/image',
      filePath: filePath,
      name: 'file', // 对应 form-data 中的 name="file"
      fileName: finalFileName,
      header: {
		'token': GetToken(),
		'primarychannelid': 99999,
		'platform': 'wxmp',
      },
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data);
            resolve(data);
          } catch (e) {
            resolve(res.data);
          }
        } else {
          reject(new Error(`上传失败: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        reject(err);
      }
    });
  });
}

export {
	Request,
	BaseURL,
	Header,
	SetToken,
	RemoveToken,
	UploadImage
}