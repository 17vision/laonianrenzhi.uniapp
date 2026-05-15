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
					<text class="item-number">3</text>
					<text class="item-label">本周次数</text>
				</view>
				<view class="overview-item">
					<text class="item-number">45</text>
					<text class="item-label">总时长(分)</text>
				</view>
			</view>
		</view>
		<view class="calendar-title">
			<text class="icon-calendar">📊</text>
			<text class="title-text">训练日历</text>
		</view>
		<!-- 训练日历（动态生成） -->
		<view class="calendar-card">
			<!-- 年月 -->
			<view class="calendar-month">{{ currentYear }}年{{ currentMonth }}月</view>
			<!-- 星期头部 -->
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
						train: day && trainDays.includes(day),
						today: day === todayDate
					}"
				>
					{{ day || '' }}
				</view>
			</view>
			<!-- 图例 -->
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

		<!-- 今日训练标题（移至最下方） -->
		<view class="today-title">
			<text class="icon-list">📋</text>
			<text class="today-title-text">今日训练</text>
		</view>

		<!-- 训练列表 -->
		<view class="training-list">
			<view class="training-item" v-for="(item, idx) in trainList" :key="idx">
				<view class="item-icon">
					<view class="icon-wrapper" :style="{ background: item.bg }">
						<text class="item-emoji">{{ item.icon }}</text>
					</view>
				</view>
				<view class="item-info">
					<text class="item-name">{{ item.name }}</text>
					<view class="item-desc">
						<text class="desc-text">{{ item.desc }} ·</text>
						<view class="stars">
							<text class="star">★</text>
							<text class="star">★</text>
						</view>
						<text class="level">L2</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onPullDownRefresh } from '@dcloudio/uni-app';

// 训练列表
const trainList = ref([
	{
		name: '时光厨房',
		desc: '记忆训练',
		icon: '🔍',
		bg: '#333'
	},
	{
		name: '星光连线',
		desc: '注意力训练',
		icon: '⭐',
		bg: '#ffc107'
	}
]);

// ========== 日历动态逻辑 ==========
const now = new Date();
const currentYear = ref(now.getFullYear());
const currentMonth = ref(now.getMonth() + 1); // 月份从0开始
const todayDate = ref(now.getDate());

// 可配置训练日（直接改数组即可）
const trainDays = ref([5, 12, 19, 24, 25, 27]);

// 生成当月所有日期（含前置空白占位）
const calendarDays = computed(() => {
	const year = currentYear.value;
	const month = currentMonth.value - 1;
	// 当月第一天
	const firstDay = new Date(year, month, 1);
	// 当月最后一天
	const lastDay = new Date(year, month + 1, 0);
	const totalDays = lastDay.getDate();
	// 第一天是周几(0周日~6周六)
	const firstWeek = firstDay.getDay();

	const days = [];
	// 前面空白占位
	for (let i = 0; i < firstWeek; i++) {
		days.push(null);
	}
	// 填充日期
	for (let i = 1; i <= totalDays; i++) {
		days.push(i);
	}
	return days;
});

onPullDownRefresh(async () => {
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

/* 概览卡片 */
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
	line-height: 1.2;
}

.item-label {
	font-size: 28rpx;
	color: #64748b;
	margin-top: 10rpx;
}

/* 训练日历卡片 */
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
/* 休息日（空白占位/普通日期） */
.day-item.rest {
	color: #666;
}
/* 训练日 */
.day-item.train {
	background: #fff1e6;
	color: #ff7d29;
	font-weight: 500;
}
/* 今天 */
.day-item.today {
	background: #ff7d29;
	color: #fff;
	font-weight: bold;
}

/* 图例 */
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

/* 今日训练标题 */
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

/* 训练列表 */
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
	transition: all 0.2s ease;
}

.training-item:active {
	transform: scale(0.98);
}

.item-icon {
	width: 88rpx;
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.icon-wrapper {
	width: 100%;
	height: 100%;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.item-emoji {
	font-size: 36rpx;
	color: #fff;
}

.item-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 10rpx;
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
	font-size: 28rpx;
	margin-right: 4rpx;
}

.level {
	color: #64748b;
	font-weight: 500;
}
</style>
