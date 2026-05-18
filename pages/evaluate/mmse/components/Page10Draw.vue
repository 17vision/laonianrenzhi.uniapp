<template>
	<view class="screen active">
		<view class="title">书写画图</view>
		<view class="progress-wrap">
			<view class="progress-text">进度：8/8</view>
			<view class="progress">
				<view class="progress-bar" style="width: 100%"></view>
			</view>
		</view>

		<view class="card">
			<view>写一句完整的话（必须包含：主语+动词，有意义）</view>
			<textarea class="input-textarea" v-model="sentenceInput" placeholder="例如：我喝水、他吃饭" />
		</view>

		<view class="card">
			<view>手绘图案（参照上方图形）</view>
			<view class="item-show">
				<text v-for="(item, index) in randomShapes" :key="index" class="shape-item">
					{{ item.shape }}
				</text>
			</view>

			<SqSign ref="sqsignRef" currentColor="#000000" canvasHeight="500rpx" canvasWidth="100%" :lineWidth="1" />
		</view>

		<button class="btn" @click="handleFinish">完成评估</button>
	</view>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue';
import { UploadFile } from '@/api/fly.js';
import SqSign from '/components/sq-sign/sq-sign.vue';

const props = defineProps({
	form: Object
});
const emit = defineEmits(['go', 'submit', 'save']);

// ==========================
// 枚举
// ==========================
const CompareType = {
	Equal: 1,
	Include: 2,
	Exclude: 3
};

// ==========================
// 图形库
// ==========================
const allShapePool = ref([
	{ shape: '△', standard: '三角形' },
	{ shape: '○', standard: '圆形' },
	{ shape: '□', standard: '正方形' },
	{ shape: '▭', standard: '长方形' },
	{ shape: '◇', standard: '菱形' },
	{ shape: '+', standard: '十字' },
	{ shape: '☆', standard: '五角星' }
]);

const randomShapes = ref([]);
const sqsignRef = ref(null);
const sentenceInput = ref('');

// ==========================
// ✅ 统一题目结构（100%对齐questions）
// ==========================
const formFields = ref([
	{
		key: 'write_sentence',
		label: '书写完整句子',
		type: 'write',
		compare_type: CompareType.Exclude,
		value: '主语+动词，完整语句',
		total_score: 2,
		userAnswer: '',
		module: 'write_ability',
		module_name: '书写与绘图能力'
	},
	{
		key: 'draw_shape',
		label: '手绘几何图形',
		type: 'draw',
		compare_type: CompareType.Exclude,
		total_score: 3,
		value: [], // 图形标准名称
		userAnswer: '', // 手绘图片地址
		shapes: [], // 图形符号
		module: 'write_ability',
		module_name: '书写与绘图能力'
	}
]);

// ==========================
// 随机图形
// ==========================
const pickRandomShapes = () => {
	let arr = [...allShapePool.value];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	randomShapes.value = arr.slice(0, 3);
};

// ==========================
// ✅ 从 questions 恢复缓存
// ==========================
const loadCache = async () => {
	if (!props.form?.questions) return;
	const questions = props.form.questions;

	formFields.value.forEach((field) => {
		const target = questions.find((q) => q.key === field.key);
		if (target) Object.assign(field, target);
	});

	// 回显句子
	sentenceInput.value = formFields.value[0].userAnswer || '';

	// 回显图形
	const draw = formFields.value[1];
	if (draw.value?.length) {
		randomShapes.value = draw.value.map((standard, i) => ({
			shape: draw.shapes[i] || '',
			standard
		}));
	}
};

// ==========================
// 校验
// ==========================
const validateAll = () => {
	if (!sentenceInput.value.trim()) {
		uni.showToast({ title: '请书写一句完整的话', icon: 'none' });
		return false;
	}
	return true;
};

// ==========================
// ✅ 提交到 questions
// ==========================
const handleFinish = async () => {
	if (!validateAll()) return;

	try {
		uni.showLoading({ title: '处理中...' });

		// 1. 生成手绘图片
		const result = await sqsignRef.value.saveSignature();
		if (!result?.tempPath) {
			uni.showToast({ title: '手绘生成失败', icon: 'none' });
			return;
		}

		// 2. 上传
		const uploadRes = await UploadFile({
			filePath: result.tempPath,
			formData: {
				info: JSON.stringify({
					referer: 'follow_up_plan',
					type: 'image'
				})
			}
		});

		if (!uploadRes?.url) {
			uni.showToast({ title: '上传失败', icon: 'none' });
			return;
		}

		// 3. 赋值答案
		formFields.value[0].userAnswer = sentenceInput.value;

		const shapeList = randomShapes.value.map((i) => i.shape);
		const standardList = randomShapes.value.map((i) => i.standard);
		formFields.value[1].shapes = shapeList;
		formFields.value[1].value = standardList;
		formFields.value[1].userAnswer = uploadRes.url;

		// 4. 合并到全局 questions
		const questions = props.form.questions || [];
		formFields.value.forEach((item) => {
			const idx = questions.findIndex((q) => q.key === item.key);
			if (idx >= 0) {
				questions[idx] = { ...questions[idx], ...item };
			} else {
				questions.push(item);
			}
		});

		// 5. 提交
		emit('submit', { questions });
		emit('go', 'result');
		emit('save');
	} catch (err) {
		console.error('提交失败', err);
		uni.showToast({ title: '操作失败', icon: 'none' });
	} finally {
		uni.hideLoading();
	}
};

// ==========================
// 初始化
// ==========================
onMounted(() => {
	pickRandomShapes();
	loadCache();
});

watch(() => props.form, loadCache, { deep: true });
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
.input-textarea {
	width: 100%;
	height: 140rpx;
	padding: 20rpx;
	border-radius: 14rpx;
	font-size: 28rpx;
	box-sizing: border-box;
	background: #f7f8fa;
	margin-top: 10rpx;
	border: none;
}
.item-show {
	width: 100%;
	text-align: center;
	font-size: 36rpx;
	margin: 20rpx 0;
}
.shape-item {
	margin: 0 20rpx;
}
.btn {
	width: 100%;
	border-radius: 18rpx;
	font-size: 30rpx;
	margin: 18rpx 0;
	background: #3b82f6;
	color: #fff;
	height: 88rpx;
	line-height: 88rpx;
}
</style>
