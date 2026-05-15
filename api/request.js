import {
	md5
} from '@/static/js/md5.js';
import {
	useUser
} from '@/store/user.js';
const BaseURL = "https://lnrz.17vision.com";
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

function Header() {
	const secret = "kN7hT7jU4aU2";
	const time = new Date().getTime();
	const token = GetToken();
	return {
		'Authorization': `Bearer ${token}`,
		'Content-Type': 'application/json',
		'Time': time,
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
					user.logout()
					reject({
						message: '登录已过期，请重新登录'
					});
				} else {
					reject({
						message: res.data?.message || '请求失败，请联系管理员'
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
export {
	Request,
	BaseURL,
	Header,
	SetToken
}