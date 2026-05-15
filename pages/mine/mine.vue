<template>
	<scroll-view scroll-y class="profile-page">
		<!-- 已登录 -->
		<block v-if="userStore.logined">
			<!-- 个人信息 -->
			<view class="user-card" @tap="goPatients">
				<view class="avatar">
					<img :src="userInfo.avatar" alt="" class="w-full" mode="widthFix" />
				</view>
				<view class="user-name">{{ showName }}</view>
				<view class="user-status">
					{{ userInfo.desc || '状态正常' }}
					<text class="risk-tag low" v-if="userInfo.riskText">● {{ userInfo.riskText }}</text>
				</view>
				<view class="user-info">
					入组日期：{{ userInfo.joinDate || '无' }} ·
					<text class="warning" v-if="userInfo.baselineTip">{{ userInfo.baselineTip }}</text>
				</view>
			</view>

			<!-- 康复数据 -->
			<view class="section">
				<view class="section-title">
					<text class="icon">📊</text>
					康复数据
				</view>
				<view class="stats-card">
					<view class="stat-item">
						<text class="stat-value blue">{{ rehabData.trainCount }}</text>
						<text class="stat-label">累计训练(次)</text>
					</view>
					<view class="stat-divider"></view>
					<view class="stat-item">
						<text class="stat-value green">{{ rehabData.totalHour }}</text>
						<text class="stat-label">总时长(小时)</text>
					</view>
					<view class="stat-divider"></view>
					<view class="stat-item">
						<text class="stat-value orange">{{ rehabData.continueDay }}</text>
						<text class="stat-label">连续天数</text>
					</view>
				</view>
			</view>

			<!-- 本周训练打卡 -->
			<view class="section">
				<view class="section-title">
					<text class="icon">📅</text>
					本周训练
				</view>
				<view class="week-card">
					<view class="day-list">
						<view class="day-item" v-for="(day, idx) in weekDays" :key="idx">
							<text class="day-name">{{ day.name }}</text>
							<view class="day-check" :class="{ done: day.done }">
								<text v-if="day.done">✓</text>
								<text v-else-if="day.disabled">—</text>
							</view>
						</view>
					</view>
					<text class="week-summary">本周完成 {{ weekFinish }} 天</text>
				</view>
			</view>

			<!-- 评估趋势 -->
			<view class="section">
				<view class="section-title">
					<text class="icon">📈</text>
					评估趋势
				</view>
				<view class="chart-box">
					<qiun-data-charts type="line" :opts="opts" :chartData="chartData" />
				</view>
			</view>

			<!-- 成就勋章 -->
			<view class="section">
				<view class="section-title">
					<text class="icon">🏆</text>
					成就勋章
				</view>
				<view class="medal-card">
					<view class="medal-grid">
						<view class="medal-item" v-for="(item, idx) in medals" :key="idx">
							<view class="medal-icon" :class="{ locked: item.locked }">
								<text>{{ item.icon }}</text>
								<view class="lock" v-if="item.locked">🔒</view>
							</view>
							<text class="medal-name" :class="{ locked: item.locked }">{{ item.name }}</text>
							<text class="medal-desc" :class="{ locked: item.locked }">{{ item.desc }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 最近动态 -->
			<view class="section">
				<view class="section-title">
					<text class="icon">⏱️</text>
					最近动态
				</view>
				<view class="list-card">
					<view class="list-item" v-for="(item, idx) in activities" :key="idx">
						<view class="item-icon">🎮</view>
						<view class="item-content">
							<view class="item-title">{{ item.title }}</view>
							<view class="item-desc">{{ item.desc }}</view>
						</view>
						<text class="item-time">{{ item.time }}</text>
					</view>
				</view>
			</view>

			<!-- 医护团队 -->
			<view class="section">
				<view class="section-title">
					<text class="icon">👨‍⚕️</text>
					我的医护团队
				</view>
				<view class="list-card">
					<view class="list-item" v-for="(item, idx) in teamList" :key="idx">
						<view class="item-avatar">{{ item.avatar }}</view>
						<view class="item-content">
							<view class="item-title">{{ item.name }}</view>
							<view class="item-desc">{{ item.title }}</view>
						</view>
					</view>
				</view>
			</view>

			<!-- 设置 -->
			<view class="section">
				<view class="section-title">
					<text class="icon">⚙️</text>
					设置
				</view>
				<view class="list-card">
					<view class="list-item" v-for="(item, idx) in settings" :key="idx">
						<view class="item-icon">{{ item.icon }}</view>
						<view class="item-content">
							<view class="item-title">{{ item.name }}</view>
						</view>
						<text class="item-value" :class="item.statusClass">{{ item.value }}</text>
					</view>
				</view>
			</view>

			<!-- 退出登录 -->
			<view class="logout-btn" @tap="handleLogout">退出登录</view>
		</block>

		<!-- 未登录 -->
		<block v-else>
			<view class="unlogin-card">
				<view class="unlogin-avatar">👤</view>
				<view class="unlogin-tip">登录后查看个人健康数据、训练记录与专属服务</view>
				<view class="login-btn" @tap="goLogin">立即登录</view>
			</view>
		</block>
	</scroll-view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app';
import { useUser } from '@/store/user.js';
import { GetUserinfo } from '@/api/fly.js';

const userStore = useUser();

// 用户信息
const userInfo = ref({});

// 康复数据
const rehabData = ref({
	trainCount: 28,
	totalHour: 7.5,
	continueDay: 5
});

// 本周打卡
const weekDays = ref([
	{ name: '日', done: false, disabled: false },
	{ name: '一', done: true, disabled: false },
	{ name: '二', done: true, disabled: false },
	{ name: '三', done: true, disabled: false },
	{ name: '四', done: false, disabled: true },
	{ name: '五', done: true, disabled: false },
	{ name: '六', done: false, disabled: true }
]);

const weekFinish = computed(() => {
	const cnt = weekDays.value.filter((i) => i.done).length;
	return `${cnt}/7`;
});

// 取第一个字（姓）+ 先生/女士，兜底昵称
// 取第一个字（姓）+ 先生/女士，兜底昵称 【正确可用版】
const showName = computed(() => {
	const user = userInfo.value || {};
	const patient = user.patient || {};

	const fullName = patient.username || user.nickname || '';
	const firstName = fullName.charAt(0) || '';
	const suffix = user.gender === 1 ? '先生' : '女士';

	return patient.username ? `${firstName}${suffix}` : firstName;
});

// 勋章
const medals = ref([
	{ icon: '⭐', name: '初次训练', desc: '完成第一次训练', locked: false },
	{ icon: '🔥', name: '连战三天', desc: '连续训练3天', locked: false },
	{ icon: '🏅', name: '一周坚持', desc: '连续训练7天', locked: false },
	{ icon: '💎', name: '十次达成', desc: '累计完成10次训练', locked: false },
	{ icon: '👑', name: '百次大师', desc: '累计完成100次训练', locked: true },
	{ icon: '🌟', name: '满分之星', desc: '正确率100%', locked: true }
]);

// 动态
const activities = ref([
	{ title: '完成「时光厨房」训练', desc: '正确率92% · L2', time: '今天 09:30' },
	{ title: '完成「星光连线」训练', desc: '正确率88% · L2', time: '4月25日' }
]);

// 医护团队
const teamList = ref([
	{ avatar: '👨‍⚕️', name: '张伟 医生', title: '神经内科 · 主任医师' },
	{ avatar: '👩‍⚕️', name: '赵静 护士', title: '神经内科 · 主管护师' }
]);

// 设置
const settings = ref([
	{ icon: '🔤', name: '字体大小', value: '大', statusClass: '' },
	{ icon: '🔊', name: '语音播报', value: '已开启', statusClass: 'on' },
	{ icon: '📱', name: '极简模式', value: '已关闭', statusClass: 'off' }
]);

// 图表
const opts = ref({
	color: ['#6366F1'],
	padding: [15, 15, 0, 5],
	enableScroll: false,
	legend: { show: false },
	xAxis: { disableGrid: true },
	yAxis: [{ min: 0 }],
	extra: {
		line: {
			type: 'straight',
			width: 3,
			activeType: 'hollow',
			activeColor: '#6366F1'
		}
	}
});

const chartData = ref({
	categories: ['1月', '2月', '3月', '4月'],
	series: [{ name: '评估分数', data: [35, 36, 31, 33] }]
});

// ==========================
// 方法
// ==========================

// 获取用户信息
const getUserInfo = async () => {
	if (!userStore.logined) return;
	try {
		const res = await GetUserinfo();
		if (res) {
			userInfo.value = res;
			userStore.setInfo(res.patient);
		}
	} catch (e) {
		console.error('获取用户信息失败', e);
	}
};

// 退出登录
const handleLogout = () => {
	uni.showModal({
		title: '确认退出',
		content: '确定要退出登录吗？',
		success: (res) => {
			if (res.confirm) {
				userStore.logout();
				uni.showToast({ title: '已退出登录', icon: 'success' });
			}
		}
	});
};

// 跳转
const goLogin = () => {
	uni.navigateTo({ url: '/pages/login/login' });
};

const goPatients = () => {
	uni.navigateTo({ url: '/pages/mine/part/patients' });
};

// 生命周期
onPullDownRefresh(async () => {
	await getUserInfo();
	uni.stopPullDownRefresh();
});

onShow(() => {
	getUserInfo();
});
</script>

<style scoped lang="scss">
.profile-page {
	padding: 30rpx;
	background: #fff8f2;
	min-height: 100vh;
	box-sizing: border-box;
}

.section {
	margin-bottom: 36rpx;
}

.section-title {
	display: flex;
	align-items: center;
	font-size: 34rpx;
	font-weight: 600;
	color: #1e293b;
	margin-bottom: 20rpx;
}

.section-title .icon {
	margin-right: 12rpx;
	font-size: 36rpx;
}

/* 用户卡片 */
.user-card {
	background: linear-gradient(180deg, #eaf5ff 0%, #fff 100%);
	border-radius: 28rpx;
	padding: 48rpx 32rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 40rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 50%;
	overflow: hidden;
	margin-bottom: 20rpx;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
}

.user-name {
	font-size: 46rpx;
	font-weight: bold;
	color: #1e293b;
	margin-bottom: 12rpx;
}

.user-status {
	font-size: 30rpx;
	color: #475569;
	margin-bottom: 8rpx;
}

.risk-tag.low {
	color: #059669;
	font-weight: 500;
}

.user-info {
	font-size: 28rpx;
	color: #94a3b8;
}

.warning {
	color: #d97706;
}

/* 未登录 */
.unlogin-card {
	background: #fff;
	border-radius: 28rpx;
	padding: 60rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 40rpx;
	box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
}

.unlogin-avatar {
	font-size: 120rpx;
	color: #cbd5e1;
	margin-bottom: 24rpx;
}

.unlogin-tip {
	font-size: 28rpx;
	color: #64748b;
	text-align: center;
	line-height: 1.6;
	margin-bottom: 36rpx;
}

.login-btn {
	width: 240rpx;
	height: 80rpx;
	background: #6366f1;
	color: #fff;
	border-radius: 40rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 32rpx;
}

/* 统计卡片 */
.stats-card {
	background: #fff;
	border-radius: 28rpx;
	padding: 40rpx 32rpx;
	display: flex;
	justify-content: space-around;
	box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);
}

.stat-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.stat-value {
	font-size: 58rpx;
	font-weight: 700;
}

.stat-value.blue {
	color: #2563eb;
}

.stat-value.green {
	color: #059669;
}

.stat-value.orange {
	color: #d97706;
}

.stat-label {
	font-size: 28rpx;
	color: #64748b;
	margin-top: 8rpx;
}

.stat-divider {
	width: 1rpx;
	background: #e2e8f0;
}

/* 星期打卡 */
.week-card {
	background: #fff;
	border-radius: 28rpx;
	padding: 40rpx 32rpx;
	box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);
}

.day-list {
	display: flex;
	justify-content: space-between;
	margin-bottom: 28rpx;
}

.day-item {
	flex: 1;
	align-items: center;
	display: flex;
	flex-direction: column;
}

.day-name {
	font-size: 26rpx;
	color: #64748b;
	margin-bottom: 12rpx;
}

.day-check {
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	border: 3rpx solid #e2e8f0;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	color: #94a3b8;
}

.day-check.done {
	background: #059669;
	border-color: #059669;
	color: #fff;
}

.week-summary {
	text-align: center;
	font-size: 28rpx;
	color: #94a3b8;
}

/* 图表 */
.chart-box {
	background: #fff;
	border-radius: 28rpx;
	padding: 20rpx;
	box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);
	height: 380rpx;
}

/* 勋章 */
.medal-card {
	background: #fff;
	border-radius: 28rpx;
	padding: 40rpx 32rpx;
	box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);
}

.medal-grid {
	display: flex;
	flex-wrap: wrap;
}

.medal-item {
	width: 33.33%;
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 32rpx;
}

.medal-icon {
	width: 84rpx;
	height: 84rpx;
	border-radius: 50%;
	background: #f8fafc;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 48rpx;
	position: relative;
}

.medal-icon.locked {
	opacity: 0.4;
}

.lock {
	position: absolute;
	font-size: 28rpx;
}

.medal-name {
	font-size: 28rpx;
	color: #1e293b;
	margin-top: 8rpx;
	text-align: center;
}

.medal-desc {
	font-size: 24rpx;
	color: #64748b;
	text-align: center;
}

/* 列表样式 */
.list-card {
	background: #fff;
	border-radius: 28rpx;
	overflow: hidden;
	box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);
}

.list-item {
	display: flex;
	align-items: center;
	padding: 36rpx 32rpx;
	border-bottom: 1rpx solid #f1f5f9;
}

.list-item:last-child {
	border-bottom: none;
}

.item-icon {
	font-size: 40rpx;
	margin-right: 24rpx;
}

.item-avatar {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	background: #eff6ff;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 36rpx;
	margin-right: 24rpx;
}

.item-content {
	flex: 1;
}

.item-title {
	font-size: 32rpx;
	color: #1e293b;
	margin-bottom: 6rpx;
}

.item-desc {
	font-size: 26rpx;
	color: #64748b;
}

.item-time {
	font-size: 26rpx;
	color: #94a3b8;
}

.item-value {
	font-size: 30rpx;
	color: #94a3b8;
}

.item-value.on {
	color: #059669;
}

/* 退出按钮 */
.logout-btn {
	background: #fff;
	color: #dc2626;
	border: 2rpx solid #dc2626;
	border-radius: 28rpx;
	height: 96rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 34rpx;
	font-weight: 600;
	margin-top: 30rpx;
}
</style>
