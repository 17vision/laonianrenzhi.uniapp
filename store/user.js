import {
	defineStore
} from 'pinia'
import {
	SetToken
} from '../api/request';

const fillable = ['uid', 'nickname', 'avatar', 'gender', 'token']

const useUser = defineStore('user', {
	state: () => ({
		uid: uni.getStorageSync('uid', ''),
		gender: uni.getStorageSync('gender', ''),
		avatar: uni.getStorageSync('avatar') || '',
		userId: uni.getStorageSync('userId', 0),
		nickname: uni.getStorageSync('nickname', ''),
		loginAt: uni.getStorageSync('loginAt') || 0,
		info: uni.getStorageSync('info') || {},
	}),
	getters: {
		logined: (state) => {
			const token = uni.getStorageSync('token')
			if (token) {
				const now = (new Date()).getTime() / 1000
				if (token.expires_at > now) {
					return true
				}
			}

			return false
		},
		getInfo: (state) => {
			return state.info
		}
	},
	actions: {
		setToken(token, expires_in) {
			SetToken(token, expires_in)
		},
		setObject(value) {
			if (value && typeof value == 'object') {
				for (let key in value) {
					if (fillable.includes(key)) {
						uni.setStorageSync(key, value[key])

						this[key] = value[key]
					}
				}
			}
		},
		setUser(value) {
			const data = {
				uid: value.id,
				avatar: value.avatar,
				gender: value.gender,
				nickname: value.nickname,
				signature: value.signature,
				user_extend: value.user_extend,
				in_days: value.in_days,
			}
			this.setObject(data)

			this.privateLogin = true
		},
		setInfo(data) {
			const fullName = data.username;
			const firstName = fullName.charAt(0) || '';
			const suffix = data.gender === 1 ? '先生' : '女士';
			const info = {
				gender: data.gender,
				gender_str: data.gender_str,
				age: data.age,
				retirement_status: data.retirement_status,
				retirement_status_str: data.retirement_status_str,
				username: data.username,
				firstName: `${firstName}${suffix}`,
			}
			this.info = info
			uni.setStorageSync('info', info)
		},
		logout() {

			fillable.forEach((key) => {
				uni.removeStorageSync(key)
				if (key == 'userId') {
					this[key] = 0
				} else {
					this[key] = ''
				}
			})

			uni.removeStorageSync('loginAt')
			this['loginAt'] = 0
		}
	}
})

export {
	useUser
}