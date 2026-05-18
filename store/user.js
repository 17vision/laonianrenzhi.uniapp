import {
	defineStore
} from 'pinia'

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
		token: uni.getStorageSync('token') || null,
	}),
	getters: {
		logined: (state) => {
			if (!state.token) return false

			const now = Math.floor(Date.now() / 1000)

			return state.token.expires_at > now
		},
		getInfo: (state) => {
			return state.info
		}
	},
	actions: {
		setToken(token, expires_in) {
			const expires_at = parseInt((new Date()).getTime() / 1000) + expires_in
			this.token = {
				token,
				expires_at
			}
			uni.setStorageSync('token', this.token)
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