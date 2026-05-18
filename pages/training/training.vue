<template>
	<view class="training-page">
		<!-- 本周训练概览卡片 -->
		<view class="overview-card">
			<view class="overview-title">
				<text class="icon-chart">📊</text>
				<text class="title-text">本周训练概览</text>
			</view>
			<view class="overview-content">
				<view class="overview-item">
					<view class="item-number">
						<text class="done">
							{{ weekDoneCount }}
						</text>

						<text class="slash">/</text>

						<text class="total">
							{{ weekTotalCount }}
						</text>
					</view>

					<text class="item-label">本周次数</text>
				</view>

				<view class="overview-item">
					<view class="item-number">
						<text class="done">
							{{ doneMinutes }}
						</text>

						<text class="slash">/</text>

						<text class="total">
							{{ totalMinutes }}
						</text>
					</view>

					<text class="item-label">总时长(分)</text>
				</view>
			</view>
		</view>

		<view class="calendar-title">
			<text class="icon-calendar">🗓️</text>
			<text class="title-text">训练日历</text>
		</view>

		<!-- 训练日历 -->
		<view class="calendar-card">
			<view class="calendar-month">{{ currentYear }}年{{ currentMonth }}月</view>
			<view class="calendar-week">
				<text class="week-item">日</text>
				<text class="week-item">一</text>
				<text class="week-item">二</text>
				<text class="week-item">三</text>
				<text class="week-item">四</text>
				<text class="week-item">五</text>
				<text class="week-item">六</text>
			</view>

			<!-- 日期网格 -->
			<view class="calendar-days">
				<view
					v-for="(day, idx) in calendarDays"
					:key="idx"
					class="day-item"
					:class="{
						rest: !day,

						train: isTrainDay(day),

						today: isToday(day),

						active: isSelectedDay(day),

						clickable: isTrainDay(day)
					}"
					@tap="onSelectDay(day)"
				>
					{{ day || '' }}
				</view>
			</view>

			<view class="calendar-legend">
				<view class="legend-item">
					<view class="legend-dot train-dot"></view>
					<text>训练日</text>
				</view>
				<view class="legend-item">
					<view class="legend-dot rest-dot"></view>
					<text>休息日</text>
				</view>
				<view class="legend-item">
					<view class="legend-dot today-dot"></view>
					<text>今天</text>
				</view>
			</view>
		</view>

		<!-- 今日训练 -->
		<view class="today-title">
			<text class="icon-list">📋</text>
			<text class="today-title-text">
				{{ displayDateText }}
			</text>
		</view>

		<view class="training-list">
			<view class="training-item" v-for="(item, idx) in trainList" :key="idx">
				<view class="item-icon">
					<view class="icon-wrapper">
						<image class="icon-image" :src="item.course_cover" mode="aspectFill"></image>
					</view>
				</view>
				<view class="item-info">
					<text class="item-name">{{ item.course_name }}</text>
					<view class="item-desc">
						<text class="desc-text">{{ Math.floor(item.duration / 60) }}分钟 ·</text>
						<view class="stars">
							<text class="star" v-for="star in item.difficulty" :key="star">★</text>
						</view>
						<text class="level">{{ item.difficulty_str }}</text>
					</view>
				</view>
			</view>

			<!-- 空数据状态 -->
			<view class="empty" v-if="trainList.length === 0">
				<!-- <image class="empty-img" src="/static/empty.png" mode="aspectFit" /> -->
				<text class="empty-text">今日暂无训练计划</text>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onPullDownRefresh, onShow } from '@dcloudio/uni-app';
import { Request } from '@/api/request.js';

// 训练列表
const trainList = ref([]);

// 整月日历数据
const dateList = ref([]);

// 当前日期
const now = new Date();
const currentYear = ref(now.getFullYear());
const currentMonth = ref(now.getMonth() + 1);
const todayDate = ref(now.getDate());

// 今日日期格式 YYYY-MM-DD
const todayStr = computed(() => {
	const y = currentYear.value;
	const m = String(currentMonth.value).padStart(2, '0');
	const d = String(todayDate.value).padStart(2, '0');
	return `${y}-${m}-${d}`;
});

// ====================================
// 1. 获取整月日历
// ====================================
const getMonthDates = async () => {
	try {
		const res = await Request('get', '/api/patient-plans-dates');
		if (Array.isArray(res)) dateList.value = res;
	} catch (e) {
		console.error('获取月日历失败', e);
	}
};
const displayDateText = computed(() => {
	if (selectedDate.value === todayStr.value) {
		return '今日训练';
	}

	return `${selectedDate.value} 训练`;
});
// ====================================
// 2. 获取今日训练计划
// ====================================
// 获取今日训练计划
const selectedDate = ref(todayStr.value);

const getTrainingByDate = async (date) => {
	try {
		const res = await Request('get', '/api/patient-plans', {
			training_date: date
		});

		let items = [];

		if (Array.isArray(res?.data)) {
			res.data.forEach((plan) => {
				if (Array.isArray(plan.course_plan?.items)) {
					items = items.concat(plan.course_plan.items);
				}
			});
		}

		trainList.value = items.map((item) => ({
			...item,
			icon: '🧠',
			bg: '#ff7d29'
		}));
	} catch (e) {
		console.error('获取训练失败', e);

		trainList.value = [];
	}
};

const onSelectDay = async (day) => {
	if (!day) return;

	if (!isTrainDay(day)) return;

	const y = currentYear.value;

	const m = String(currentMonth.value).padStart(2, '0');

	const d = String(day).padStart(2, '0');

	const date = `${y}-${m}-${d}`;

	selectedDate.value = date;

	await getTrainingByDate(date);
};

const isSelectedDay = (day) => {
	if (!day) return false;

	const y = currentYear.value;

	const m = String(currentMonth.value).padStart(2, '0');

	const d = String(day).padStart(2, '0');

	return selectedDate.value === `${y}-${m}-${d}`;
};

// ====================================
// 页面初始化
// ====================================
const init = async () => {
	selectedDate.value = todayStr.value;
	await getMonthDates();
	await getTrainingByDate(selectedDate.value);
	await getTrainingInfo(); 
};

// ====================================
// 日历生成
// ====================================
const calendarDays = computed(() => {
	const year = currentYear.value;
	const month = currentMonth.value - 1;
	const firstDay = new Date(year, month, 1);
	const lastDay = new Date(year, month + 1, 0);
	const totalDays = lastDay.getDate();
	const firstWeek = firstDay.getDay();

	const days = [];
	for (let i = 0; i < firstWeek; i++) days.push(null);
	for (let i = 1; i <= totalDays; i++) days.push(i);
	return days;
});

// ====================================
// 判断今天
// ====================================
const isToday = (day) => {
	if (!day) return false;
	return day === todayDate.value;
};

// ====================================
// 判断训练日
// ====================================

const isTrainDay = (day) => {
	if (!day) return false;
	const item = dateList.value.find((i) => i.year === currentYear.value && i.month === currentMonth.value && i.day === day);
	return item?.is_training === 1;
};

// ====================================
// 统计本月训练次数
// ====================================
const getTrainingInfo = async () => {
	try {
		const res = await Request('get', '/api/patient-plans-training-info');
		weekStats.value = res;
	} catch (e) {
		console.error('获取训练信息失败', e);
	}
};

const weekStats = ref({});
const weekDoneCount = computed(() => weekStats.value?.already_training_nums || 0);

const weekTotalCount = computed(() => weekStats.value?.plan_training_nums || 0);

const secToMin = (sec = 0) => Math.floor(sec / 60);

const doneMinutes = computed(() => secToMin(weekStats.value?.already_training_duration));

const totalMinutes = computed(() => secToMin(weekStats.value?.plan_training_duration));

// 生命周期
onShow(() => init());
onPullDownRefresh(async () => {
	await init();
	uni.stopPullDownRefresh();
});
</script>

<style scoped>
.training-page {
	padding: 30rpx;
	background-color: #fff8f2;
	min-height: 100vh;
	box-sizing: border-box;
}

.overview-card {
	background: #fff;
	border-radius: 28rpx;
	padding: 40rpx;
	margin-bottom: 40rpx;
	box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);
}
.overview-title {
	display: flex;
	align-items: center;
	margin-bottom: 40rpx;
}
.icon-chart {
	font-size: 34rpx;
	margin-right: 14rpx;
}
.title-text {
	font-size: 34rpx;
	font-weight: 600;
	color: #1e293b;
}
.overview-content {
	display: flex;
	justify-content: space-around;
}
.overview-item {
	display: flex;
	flex-direction: column;
	align-items: center;
}
.item-number {
	font-size: 60rpx;
	font-weight: bold;
	color: #2563eb;
}
.item-label {
	font-size: 28rpx;
	color: #64748b;
	margin-top: 10rpx;
}

.calendar-title {
	display: flex;
	align-items: center;
	margin-bottom: 24rpx;
}
.icon-calendar {
	font-size: 34rpx;
	margin-right: 14rpx;
}

.calendar-card {
	background: #fff;
	border-radius: 28rpx;
	padding: 40rpx;
	margin-bottom: 40rpx;
	box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.04);
}
.calendar-month {
	font-size: 40rpx;
	font-weight: bold;
	text-align: center;
	margin: 20rpx 0 30rpx;
	color: #333;
}
.calendar-week {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	margin-bottom: 20rpx;
}
.week-item {
	text-align: center;
	font-size: 28rpx;
	color: #999;
}
.calendar-days {
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 16rpx;
}
.day-item {
	aspect-ratio: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30rpx;
	border-radius: 50%;
}
.item-number {
	display: flex;

	align-items: baseline;

	justify-content: center;

	gap: 8rpx;
}

.done {
	font-size: 54rpx;

	font-weight: 700;

	color: #2563eb;
}

.slash {
	font-size: 30rpx;

	color: #94a3b8;
}

.total {
	font-size: 38rpx;

	font-weight: 600;

	color: #64748b;
}
.day-item.rest {
	color: #666;
}
.day-item.train {
	background: #fff1e6;
	color: #ff7d29;
	font-weight: 500;
}
.day-item.today {
	background: #ff7d29;
	color: #fff;
	font-weight: bold;
}

.calendar-legend {
	display: flex;
	justify-content: center;
	gap: 40rpx;
	margin-top: 40rpx;
	font-size: 26rpx;
	color: #666;
}
.legend-item {
	display: flex;
	align-items: center;
	gap: 10rpx;
}
.legend-dot {
	width: 24rpx;
	height: 24rpx;
	border-radius: 50%;
}
.train-dot {
	background: #fff1e6;
	border: 1rpx solid #ff7d29;
}
.rest-dot {
	background: #fff;
	border: 1rpx solid #ccc;
}
.today-dot {
	background: #ff7d29;
}

.today-title {
	display: flex;
	align-items: center;
	margin-bottom: 24rpx;
}
.icon-list {
	font-size: 38rpx;
	margin-right: 12rpx;
}
.today-title-text {
	font-size: 38rpx;
	font-weight: bold;
	color: #1e293b;
}

.training-list {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}
.training-item {
	background: #fff;
	border-radius: 28rpx;
	padding: 36rpx;
	display: flex;
	align-items: center;
	gap: 28rpx;
	box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
}
.item-icon {
	width: 88rpx;
	height: 88rpx;
}
.icon-wrapper {
	width: 100%;
	height: 100%;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	overflow: hidden;
}
.icon-image {
	width: 100%;
	height: 100%;
}
.item-emoji {
	font-size: 36rpx;
	color: #fff;
}
.item-info {
	flex: 1;
}
.item-name {
	font-size: 36rpx;
	font-weight: 600;
	color: #1e293b;
}
.item-desc {
	display: flex;
	align-items: center;
	font-size: 28rpx;
	color: #64748b;
}
.stars {
	display: flex;
	margin: 0 6rpx;
}
.star {
	color: #ffc107;
	margin-right: 4rpx;
}
.level {
	color: #64748b;
	font-weight: 500;
}

.clickable {
	cursor: pointer;

	transition: 0.2s;
}

.clickable:active {
	transform: scale(0.92);
}
</style>
