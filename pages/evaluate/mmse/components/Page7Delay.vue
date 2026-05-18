<template>
	<view class="screen active">
		<view class="title">回忆测试</view>
		<view class="progress-wrap">
			<view class="progress-text">进度：5/8</view>
			<view class="progress">
				<view class="progress-bar" style="width: 62.5%"></view>
			</view>
		</view>
		<view class="card">
			<view class="text-center">输入刚才看到的3个物品</view>
			<input class="input" v-model="userAnswers[0]" placeholder="物品1" />
			<input class="input" v-model="userAnswers[1]" placeholder="物品2" />
			<input class="input" v-model="userAnswers[2]" placeholder="物品3" />
		</view>
		<button class="btn" @click="handleNext">下一页</button>
	</view>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
	form: Object
});
const emit = defineEmits(['go', 'submit']);

// 用户输入
const userAnswers = ref(['', '', '']);

// ==========================
// 修复：缓存回显（深度读取 + 强制赋值）
// ==========================
const restoreCache = () => {
	if (!props.form?.questions) return;
	
	// 找到记忆题
	const memoryItem = props.form.questions.find(q => q.key === 'memory_items');
	console.log(memoryItem);
	if (!memoryItem) return;
	
	// 安全回显答案
	const answer = memoryItem.userAnswer || [];
	userAnswers.value[0] = answer[0] || '';
	userAnswers.value[1] = answer[1] || '';
	userAnswers.value[2] = answer[2] || '';
};

// ==========================
// 提交
// ==========================
const handleNext = () => {
	if (userAnswers.value.some(item => !item.trim())) {
		uni.showToast({ title: '请填写全部3个物品', icon: 'none' });
		return;
	}

	const questions = props.form.questions || [];
	const idx = questions.findIndex(q => q.key === 'memory_items');
	if (idx !== -1) {
		questions[idx].userAnswer = userAnswers.value;
	}

	emit('submit', { questions });
	emit('go', 'q6');
};

onMounted(() => restoreCache());
watch(() => props.form, restoreCache, { deep: true });
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
.progress-wrap {
	margin: 20rpx 0;
}
.progress-text {
	font-size: 24rpx;
	color: #86909c;
}
.progress {
	height: 10rpx;
	background: #edf1f5;
	border-radius: 999rpx;
	overflow: hidden;
}
.progress-bar {
	height: 100%;
	background: linear-gradient(90deg, #3b82f6, #22c55e);
	transition: width 0.3s ease;
}
.card {
	background: #fff;
	border-radius: 20rpx;
	padding: 26rpx;
	margin: 20rpx 0;
}
.text-center {
	text-align: center;
	font-size: 28rpx;
	margin-bottom: 20rpx;
}
.input {
	width: 100%;
	height: 84rpx;
	padding: 0 22rpx;
	border-radius: 14rpx;
	font-size: 28rpx;
	background: #f7f8fa;
	margin-bottom: 15rpx;
	border: none;
	outline: none;
}
.btn {
	width: 100%;
	height: 88rpx;
	border-radius: 18rpx;
	font-size: 30rpx;
	margin: 18rpx 0;
	background: linear-gradient(135deg, #3b82f6, #2563eb);
	color: #fff;
	border: none;
	outline: none;
}
</style>