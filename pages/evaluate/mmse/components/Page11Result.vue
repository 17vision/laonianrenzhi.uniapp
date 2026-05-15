<template>
	<view class="screen active">
		<view class="title">评估完成</view>
		<view class="">等待医护人员评估确认</view>
		<view class="result-box" :class="{ normal: totalScore >= 27, abnormal: totalScore < 27 }">
			<view class="total-title">总分：{{ totalScore }}/30分</view>
			<view class="level-text">{{ levelText }}</view>
		</view>
		<view class="score-list">
			<view class="score-item">定向力：{{ score[0] }}/10分</view>
			<view class="score-item">瞬时记忆：{{ score[1] }}/3分</view>
			<view class="score-item">计算力：{{ score[2] }}/5分</view>
			<view class="score-item">延迟回忆：{{ score[3] }}/3分</view>
			<view class="score-item">语言能力：{{ score[4] }}/9分</view>
		</view>
		<button class="btn" @click="emit('reset')">重新评估</button>
	</view>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
	form: {
		type: Object,
		default: () => ({})
	}
});
const emit = defineEmits(['reset']);

// 适配后端评分结构：自动转为数组 [定向力,瞬时记忆,计算力,延迟回忆,语言能力]
const score = computed(() => {
	const s = props.form?.score || {};
	return [s.time_score || 0, s.memory_score || 0, s.calc_score || 0, s.command_score || 0, s.language_score || 0];
});

// 总分（自动兼容两种字段）
const totalScore = computed(() => {
	return props.form?.totalScore || props.form?.total_score || 0;
});

// 认知等级
const levelText = computed(() => {
	const num = totalScore.value;
	if (num >= 27) return '认知功能正常';
	if (num >= 23) return '轻度认知障碍';
	if (num >= 18) return '中度认知障碍';
	return '重度认知障碍';
});
</script>

<style lang="scss" scoped>
.screen {
	background: #fff;
	padding: 32rpx 28rpx;
	border-radius: 24rpx;
}
.title {
	font-size: 38rpx;
	font-weight: 700;
	text-align: center;
	margin: 20rpx 0;
}
.result-box {
	padding: 34rpx;
	border-radius: 24rpx;
	text-align: center;
	margin: 20rpx 0;
	font-weight: 600;
}
.normal {
	background: #ecfdf5;
	color: #047857;
}
.abnormal {
	background: #fef2f2;
	color: #b91c1c;
}
.total-title {
	font-size: 48rpx;
}
.level-text {
	font-size: 30rpx;
	margin-top: 12rpx;
}
.score-list {
	margin: 30rpx 0;
}
.score-item {
	margin: 16rpx 0;
	font-size: 28rpx;
	color: #4e5969;
	line-height: 1.6;
}
.btn {
	width: 100%;
	border-radius: 18rpx;
	font-size: 30rpx;
	margin: 40rpx 0 18rpx;
	background: linear-gradient(135deg, #3b82f6, #2563eb);
	color: #fff;
	border: none;
	padding: 24rpx;
}
</style>
