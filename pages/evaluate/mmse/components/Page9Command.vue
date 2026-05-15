<template>
	<view class="screen active">
		<view class="title">指令执行</view>
		<view class="progress-wrap">
			<view class="progress-text">进度：7/8</view>
			<view class="progress">
				<view class="progress-bar" style="width: 87.5%"></view>
			</view>
		</view>

		<view class="card">
			<view class="bold text-center">举起右手,摸鼻子,眨眼睛</view>
			<input class="input" v-model="commandInput" placeholder="按顺序输入步骤，逗号分隔" />
		</view>

		<view class="card">
			<view class="bold">阅读执行：请闭上眼睛</view>
			<input class="input" v-model="readInput" placeholder="输入执行结果（已完成/未完成）" />
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

// ==========================
// 全局统一枚举
// ==========================
const CompareType = {
	Equal: 1,
	Include: 2
};

// ==========================
// 统一表单结构
// ==========================
const formFields = ref([
	{
		key: 'command_3_steps',
		label: '三步指令执行',
		type: 'command',
		total_score: 1,
		score: 0,
		compare_type: CompareType.Equal,
		value: '举起右手,摸鼻子,眨眼睛',
		answer: '',
		module: 'command_ability',
		module_name: '指令执行能力'
	},
	{
		key: 'command_close_eye',
		label: '闭眼指令执行',
		type: 'command',
		total_score: 1,
		score: 0,
		compare_type: CompareType.Equal,
		value: '已完成',
		answer: '',
		module: 'command_ability',
		module_name: '指令执行能力'
	}
]);

// 输入绑定
const commandInput = ref('');
const readInput = ref('');

// 统一校验
const validateAll = () => {
	if (!commandInput.value.trim()) return false;
	if (!readInput.value.trim()) return false;
	return true;
};

// ==========================
// 提交：统一规范格式
// ==========================
const handleNext = () => {
	if (!validateAll()) {
		uni.showToast({ title: '请完成所有题目', icon: 'none' });
		return;
	}

	formFields.value[0].answer = commandInput.value;
	formFields.value[1].answer = readInput.value;

	emit('submit', {
		command_ability: formFields.value
	});
	emit('go', 'q8');
};

// ==========================
// 缓存回填
// ==========================
const restoreCache = () => {
	if (!props.form) return;
	const data = props.form.command_ability || [];
	if (data.length >= 1) commandInput.value = data[0].answer || '';
	if (data.length >= 2) readInput.value = data[1].answer || '';
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
.bold {
	font-weight: 600;
	font-size: 28rpx;
	text-align: center;
	margin-bottom: 15rpx;
}
.input {
	width: 100%;
	height: 84rpx;
	padding: 0 22rpx;
	border-radius: 14rpx;
	font-size: 28rpx;
	box-sizing: border-box;
	background: #f7f8fa;
	margin: 10rpx 0;
}
.btn {
	width: 100%;
	border-radius: 18rpx;
	font-size: 30rpx;
	margin: 18rpx 0;
	background: linear-gradient(135deg, #3b82f6, #2563eb);
	color: #fff;
	height: 88rpx;
	line-height: 88rpx;
}
</style>