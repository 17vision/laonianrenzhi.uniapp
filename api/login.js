import {
	useUser
} from '@/store/user.js'
import {
	WxMiniLogin,
	GetUserinfo
} from '@/api/fly.js'

export default async function islogin() {

	const userStore = useUser()

	// 已登录
	if (userStore.logined) {

		// 没有用户信息再拉取
		if (!userStore.info) {
			await fetchUserInfo()
		}

		return true
	}

	try {

		const {
			code
		} = await new Promise(
			(resolve, reject) => {

				uni.login({
					provider: 'weixin',
					success: resolve,
					fail: reject
				})
			}
		)
		const res = await WxMiniLogin({
			code
		})

		// 新用户
		if (res?.openid) {
			return {
				isNewUser: true
			}
		}

		// 老用户登录
		userStore.setToken(res.token, res.expires_in ?? 24 * 60 * 60)

		await fetchUserInfo()

		return {
			isNewUser: false
		}

	} catch (e) {

		console.error(
			'登录失败',
			e
		)

		return false
	}
}

async function fetchUserInfo() {

	const userStore = useUser()

	try {

		const res =
			await GetUserinfo()

		if (res?.patient) {

			userStore.setInfo(
				res.patient
			)
		}

	} catch (e) {

		console.error(
			'获取用户信息失败',
			e
		)
	}
}