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

// 缓存里的记忆题目对象
let memoryItem = ref(null);

// ==========================
// 恢复缓存（直接拿完整对象）
// ==========================
const restoreCache = () => {
	if (!props.form?.memory_training) return;

	// 直接拿到上一页的完整结构，不手写任何字段
	memoryItem.value = props.form.memory_training[0];

	// 恢复答案
	if (memoryItem.value?.answer) {
		userAnswers.value = memoryItem.value.answer;
	}
};

// ==========================
// 提交：直接修改 answer 后原样提交
// ==========================
const handleNext = () => {
	if (userAnswers.value.some((item) => !item)) {
		uni.showToast({ title: '请填写全部3个物品', icon: 'none' });
		return;
	}

	// 只修改答案，其他完全不变
	memoryItem.value.answer = userAnswers.value;

	// 直接提交缓存里的原结构
	emit('submit', {
		memory_training: [memoryItem.value]
	});

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
}
.progress-bar {
	height: 100%;
	background: linear-gradient(90deg, #3b82f6, #22c55e);
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
}
.btn {
	width: 100%;
	border-radius: 18rpx;
	font-size: 30rpx;
	margin: 18rpx 0;
	background: linear-gradient(135deg, #3b82f6, #2563eb);
	color: #fff;
	border: none;
}
</style>
