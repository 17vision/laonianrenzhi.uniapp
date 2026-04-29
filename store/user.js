import { defineStore } from 'pinia'
import { SetToken, RemoveToken } from '../api/request';

const fillable = ['userId', 'phone', 'nickname', 'avatar']

const useUser = defineStore('user', {
	state: () => ({
		userId: uni.getStorageSync('userId', 0),
		nickname: uni.getStorageSync('nickname', ''),
		phone: uni.getStorageSync('phone', ''),
		avatar: uni.getStorageSync('avatar') || '',
		loginAt: uni.getStorageSync('loginAt') || 0
	}),
	getters: {
		logined: (state) =>{
			if (!state.loginAt) {
				return false;
			}
			
			// 登录保持三个小时吧
			if ((new Date()).getTime() - state.loginAt > 1000 * 60 * 60 * 3) {
				return false
			}		
			return true
		}
	},
	actions: {
		setUser(value) {
			if (value && typeof value == 'object') {
				for (let key in value) {
					if (fillable.includes(key)) {
						uni.setStorageSync(key, value[key])
						this[key] = value[key]
					}
				}
			}
			
			if(value && value.token) {
				SetToken(value.token, 60 * 60 * 24)
				
				const time = (new Date()).getTime()
				uni.setStorageSync('loginAt', time)
				this['loginAt'] = time
			}
		},
		logout() {
			RemoveToken()
			
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

export { useUser }