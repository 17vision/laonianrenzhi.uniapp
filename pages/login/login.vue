<template>
	<view class="container">
		<!-- 顶部 -->
		<view class="header">
			<view class="title">欢迎登录</view>
			<view class="subtitle">登录后体验更多功能</view>
		</view>

		<!-- 登录主体 -->
		<view class="content">
			<view class="list">
				<!-- 头像 -->
				<view class="item">
					<text class="label">头像</text>
					<button open-type="chooseAvatar" class="avatar-btn" plain @chooseavatar="chooseAvatar">
						<image v-if="form.avatar" :src="form.avatar" class="avatar-img" />
						<text v-else class="tip">请选择头像</text>
					</button>
				</view>

				<!-- 昵称 -->
				<view class="item">
					<text class="label">昵称</text>
					<input v-model="form.nickname" placeholder="请输入昵称" maxlength="16" class="input" />
				</view>
			</view>

			<!-- 登录按钮 -->
			<button class="login-btn" @tap="goLogin" :disabled="!isAgree">登录</button>
		</view>

		<!-- 底部 -->
		<view class="footer">
			<view class="agreement">
				<checkbox-group @change="handleAgree">
					<checkbox :checked="isAgree" color="#C3824E" />
				</checkbox-group>
				<text>
					同意
					<text class="link" @tap="goToPrivacy">《用户协议和隐私政策》</text>
				</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { WxMiniLogin, UploadImages } from '@/api/fly.js';
import { useUser } from '@/store/user.js';

/* ================= 状态 ================= */
const isAgree = ref(false);

const form = reactive({
	avatar: '',
	nickname: '',
	openid: ''
});

const user = useUser();

/* ================= 生命周期 ================= */
onLoad(() => {
	// 微信小程序自动获取 openid
	uni.login({
		provider: 'weixin',
		success: async ({ code }) => {
			const res = await WxMiniLogin({ code });
			if (res?.openid) {
				form.openid = res.openid;
			} else {
				handleLoginSuccess(res, false);
			}
		}
	});
});

/* ================= 登录校验 ================= */
function checkAgree() {
	if (!isAgree.value) {
		uni.showToast({ title: '请同意用户协议', icon: 'none' });
		return false;
	}
	return true;
}

/* ================= 微信小程序登录 ================= */
async function goLogin() {
	if (!form.avatar) {
		uni.showToast({ title: '请选择头像', icon: 'none' });
		return;
	}
	if (!form.nickname) {
		uni.showToast({ title: '请输入昵称', icon: 'none' });
		return;
	}
	if (!checkAgree()) return;

	try {
		const res = await WxMiniLogin({
			openid: form.openid,
			nickname: form.nickname
		});
		handleLoginSuccess(res, true);
	} catch {
		uni.showToast({ title: '登录失败', icon: 'none' });
	}
}

/* ================= 登录成功统一处理 ================= */
function handleLoginSuccess(data, isNew) {
	user.setToken(data.token, data.expires_in ?? 24 * 60 * 60);
	user.setUser(data);

	if (!isNew) {
		uni.navigateBack();
		return;
	}

	// 上传头像
	UploadImages({ file: form.avatar, referer: 'avatar' })
		.then((res) => {
			if (res?.url) {
				user.setObject({ avatar: res.url });
			}
		})
		.finally(() => {
			uni.navigateBack();
		});
}

/* ================= 选择头像 ================= */
function chooseAvatar(e) {
	const avatarUrl = e?.detail?.avatarUrl;
	if (!avatarUrl) return;

	uni.getFileSystemManager().readFile({
		filePath: avatarUrl,
		encoding: 'base64',
		success: (res) => {
			form.avatar = `data:image/jpeg;base64,${res.data}`;
		}
	});
}

/* ================= 协议 ================= */
const handleAgree = (e) => {
	isAgree.value = e.detail.value.length > 0;
};

const goToPrivacy = () => {
	uni.navigateTo({ url: '/pages/login/agreement' });
};
</script>

<style lang="scss" scoped>
$primary: #c3824e;
$text-main: #333;
$text-sub: #999;
$bg-input: #f7f7f7;

page {
	background-color: #fff8f2;
}

.container {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	padding: 0 40rpx;
}

/* 标题 */
.header {
	margin-top: 120rpx;
	text-align: center;

	.title {
		font-size: 48rpx;
		font-weight: 600;
		color: $text-main;
	}

	.subtitle {
		margin-top: 16rpx;
		font-size: 28rpx;
		color: $text-sub;
	}
}

/* 内容 */
.content {
	flex: 1;
	margin-top: 100rpx;
}

.list {
	background: #fff;
	border-radius: 20rpx;
	overflow: hidden;
}

.item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30rpx 0;
	border-bottom: 1rpx solid #f0f0f0;

	.label {
		font-size: 30rpx;
		color: $text-main;
	}
}

/* 头像按钮 */
.avatar-btn {
	padding: 0;
	margin: 0;
	box-shadow: none;
	border: none;
	background: none;
	display: flex;
	align-items: center;
	justify-content: flex-end;
}

.avatar-img {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
}

.tip {
	font-size: 28rpx;
	color: $text-sub;
}

/* 昵称输入框 */
.input {
	font-size: 28rpx;
	color: $text-main;
	text-align: right;
}

/* 登录按钮 */
.login-btn {
	width: 100%;
	height: 88rpx;
	border-radius: 44rpx;
	background-color: $primary;
	color: #fff;
	font-size: 32rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-top: 60rpx;

	&:active {
		opacity: 0.85;
	}

	&[disabled] {
		opacity: 0.5;
	}
}

/* 底部协议 */
.footer {
	padding-bottom: 40rpx;
}

.agreement {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 24rpx;
	color: #666;

	.link {
		color: $primary;
	}
}
</style>
