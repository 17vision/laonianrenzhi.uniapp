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
// 表单结构
// ==========================
const formFields = ref([
	{
		key: 'write_sentence',
		label: '书写完整句子',
		type: 'write',
		compare_type: CompareType.Exclude,
		value: '主语+动词，完整语句',
		total_score: 2,
		score: 0,
		prompt: '判断用户输入的是否为一句完整、有意义的话，必须包含主语和动词，语句通顺合理即可',
		answer: '',
		module: 'write_ability',
		module_name: '书写与绘图能力'
	},
	{
		key: 'draw_shape',
		label: '手绘几何图形',
		type: 'draw',
		compare_type: CompareType.Exclude,
		total_score: 3,
		score: 0,
		shapes: [],
		value: [],
		prompt: '根据展示的几何图形，判断用户是否手绘完成，形状大致相似、结构正确即可得分',
		answer: '',
		module: 'write_ability',
		module_name: '书写与绘图能力'
	}
]);

// ==========================
// ✅【核心】加载缓存并回显所有内容
// ==========================
const loadCache = async () => {
	if (!props.form || !props.form.write_ability) return;

	const writeData = props.form.write_ability;

	// 1. 回显句子
	const writeSentence = writeData.find((v) => v.key === 'write_sentence');
	if (writeSentence) {
		sentenceInput.value = writeSentence.answer || '';
		formFields.value[0].answer = writeSentence.answer || '';
	}

	// 2. 回显图形 + 手绘图片
	const drawShape = writeData.find((v) => v.key === 'draw_shape');
	if (drawShape) {
		// 图形回显
		if (drawShape.shapes && drawShape.value) {
			randomShapes.value = drawShape.shapes.map((s, i) => ({
				shape: s,
				standard: drawShape.value[i]
			}));
		}

		// 同步到表单
		formFields.value[1].shapes = drawShape.shapes || [];
		formFields.value[1].value = drawShape.value || [];
		formFields.value[1].answer = drawShape.answer || '';
	}
};

// ==========================
// 提交
// ==========================
const validateAll = () => {
	if (!sentenceInput.value.trim()) {
		uni.showToast({ title: '请书写一句完整的话', icon: 'none' });
		return false;
	}
	return true;
};

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

		// 3. 组装数据
		const shapeList = randomShapes.value.map((i) => i.shape);
		const standardList = randomShapes.value.map((i) => i.standard);

		formFields.value[0].answer = sentenceInput.value;
		formFields.value[1].shapes = shapeList;
		formFields.value[1].value = standardList;
		formFields.value[1].answer = uploadRes.url;

		// 4. 提交
		emit('submit', {
			write_ability: formFields.value
		});
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

watch(
	() => props.form,
	() => {
		loadCache();
	},
	{ deep: true }
);
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
