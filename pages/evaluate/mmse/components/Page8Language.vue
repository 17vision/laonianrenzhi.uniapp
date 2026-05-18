<template>
	<view class="screen active">
		<view class="title">语言表达</view>
		<view class="progress-wrap">
			<view class="progress-text">进度：6/8</view>
			<view class="progress">
				<view class="progress-bar" style="width: 75%"></view>
			</view>
		</view>

		<!-- 随机物品列表 -->
		<view class="card">
			<view class="text-center">输入物品名称</view>
			<view v-for="(item, index) in randomItems" :key="index" class="item-wrapper">
				<view class="item-show">{{ item.icon }}</view>
				<input class="input" v-model="item.userAnswer" placeholder="输入物品名称" />
			</view>
		</view>

		<view class="card">
			<view>请复述：{{ randomSentence }}</view>
			<input class="input" v-model="repeatText" placeholder="文字输入复述内容" />

			<view class="flex-row gap-10">
				<button class="btn btn-record" @click="toggleRecord">{{ recordBtnText }}</button>
			</view>
		</view>

		<button class="btn" @click="handleNext">下一页</button>
	</view>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';

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
// 物品库
// ==========================
const allItemPool = ref([
	{ icon: '🧊', standard: '冰块' },
	{ icon: '🧺', standard: '毛巾' },
	{ icon: '🍎', standard: '苹果' },
	{ icon: '📘', standard: '书本' },
	{ icon: '⌚', standard: '手表' },
	{ icon: '👒', standard: '帽子' },
	{ icon: '🧦', standard: '袜子' },
	{ icon: '📱', standard: '手机' },
	{ icon: '🍌', standard: '香蕉' },
	{ icon: '🍇', standard: '葡萄' },
	{ icon: '🍞', standard: '面包' },
	{ icon: '💡', standard: '灯泡' },
	{ icon: '✂️', standard: '剪刀' },
	{ icon: '⚽', standard: '足球' },
	{ icon: '🍰', standard: '蛋糕' }
]);

// 复述句子库（可自由增删）
const sentencePool = ref(['四十四只石狮子', '粉红墙上画凤凰', '化肥会挥发', '黑化肥发灰', '吃葡萄不吐葡萄皮', '班干部管班干部']);

// 随机抽取2个物品
const randomItems = ref([]);
const pickRandomItems = () => {
	let arr = [...allItemPool.value];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	randomItems.value = arr.slice(0, 2).map((item) => ({
		icon: item.icon,
		standard: item.standard,
		userAnswer: ''
	}));
};

// 随机抽取复述句子
const randomSentence = ref('');
const pickRandomSentence = () => {
	const idx = Math.floor(Math.random() * sentencePool.value.length);
	randomSentence.value = sentencePool.value[idx];
};

// ==========================
// 题目结构 对齐现有 questions
// ==========================
const formFields = ref([
	{
		key: 'language_naming',
		label: '物品命名',
		type: 'language',
		total_score: 2,
		compare_type: CompareType.Include,
		value: [],
		userAnswer: [],
		module: 'language_ability',
		module_name: '语言能力'
	},
	{
		key: 'language_repeat',
		label: '句子复述',
		type: 'language',
		total_score: 2,
		compare_type: CompareType.Include,
		value: '', // 随机句子存在这里
		userAnswer: '',
		module: 'language_ability',
		module_name: '语言能力'
	}
]);

const repeatText = ref('');

// ====================== 语音识别 ======================
const recordBtnText = ref('语音识别');
const isRecording = ref(false);
let manager = null;

// #ifdef MP-WEIXIN
onMounted(() => {
	try {
		const plugin = requirePlugin('WechatSI');
		manager = plugin.getRecordRecognitionManager();
		manager.onRecognize = (res) => {
			if (res.result) {
				repeatText.value = res.result;
			}
		};
		manager.onStop = (res) => {
			isRecording.value = false;
			recordBtnText.value = '语音识别';
			if (res.result) repeatText.value = res.result;
		};
		manager.onError = (err) => {
			isRecording.value = false;
			recordBtnText.value = '语音识别';
		};
	} catch (e) {}
});
// #endif

onUnmounted(() => {
	if (manager) manager.stop();
});

const toggleRecord = () => {
	// #ifndef MP-WEIXIN
	uni.showToast({ title: '仅微信小程序支持语音识别', icon: 'none' });
	return;
	// #endif
	if (!manager) return;
	if (!isRecording.value) {
		isRecording.value = true;
		recordBtnText.value = '停止录音';
		repeatText.value = '';
		manager.start({ duration: 30000, lang: 'zh_CN' });
	} else {
		isRecording.value = false;
		recordBtnText.value = '语音识别';
		manager.stop();
	}
};

// 校验
const validateAll = () => {
	for (let item of randomItems.value) {
		if (!item.userAnswer.trim()) return false;
	}
	if (!repeatText.value.trim()) return false;
	return true;
};

// ==========================
// 提交存入 questions
// ==========================
const handleNext = () => {
	if (!validateAll()) {
		uni.showToast({ title: '请完成所有题目', icon: 'none' });
		return;
	}

	// 物品命名
	formFields.value[0].value = randomItems.value.map((i) => i.standard);
	formFields.value[0].userAnswer = randomItems.value.map((i) => i.userAnswer);

	// 句子复述：标准答案是随机句子
	formFields.value[1].value = randomSentence.value;
	formFields.value[1].userAnswer = repeatText.value;

	// 合并到全局 questions
	const questions = props.form.questions || [];
	formFields.value.forEach((item) => {
		const idx = questions.findIndex((q) => q.key === item.key);
		if (idx >= 0) {
			questions[idx] = { ...questions[idx], ...item };
		} else {
			questions.push(item);
		}
	});

	emit('submit', { questions });
	emit('go', 'q7');
};

// ==========================
// 缓存恢复
// ==========================
const restoreCache = () => {
	if (!props.form?.questions) return;
	const questions = props.form.questions;

	formFields.value.forEach((field) => {
		const target = questions.find((q) => q.key === field.key);
		if (target) Object.assign(field, target);
	});

	// 恢复物品
	const naming = formFields.value[0];
	if (naming.value?.length) {
		randomItems.value = naming.value.map((standard, i) => ({
			icon: allItemPool.value.find((item) => item.standard === standard)?.icon || '❓',
			standard,
			userAnswer: naming.userAnswer[i] || ''
		}));
	}

	// 恢复复述句子和用户答案
	const repeat = formFields.value[1];
	if (repeat.value) {
		randomSentence.value = repeat.value;
	}
	repeatText.value = repeat.userAnswer || '';
};

onMounted(() => {
	pickRandomItems();
	pickRandomSentence();
	restoreCache();
});

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
	margin-bottom: 10rpx;
}
.item-show {
	height: 160rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 80rpx;
	background: #f9fafb;
	border-radius: 20rpx;
	margin: 15rpx 0;
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
.flex-row {
	display: flex;
	gap: 10rpx;
}
.btn {
	width: 100%;
	border-radius: 18rpx;
	font-size: 30rpx;
	margin: 18rpx 0;
	background: linear-gradient(135deg, #3b82f6, #2563eb);
	color: #fff;
}
.btn-green {
	background: linear-gradient(135deg, #22c55e, #16a34a);
}
.btn-record {
	background: linear-gradient(135deg, #fb923c, #f97316);
}
.tip {
	text-align: center;
	font-size: 24rpx;
	color: #86909c;
	margin-top: 10rpx;
}
</style>
