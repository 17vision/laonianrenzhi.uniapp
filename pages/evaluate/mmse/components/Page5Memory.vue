<template>
	<view class="screen active">
		<view class="title">记忆训练</view>
		<view class="progress-wrap">
			<view class="progress-text">进度：3/8</view>
			<view class="progress">
				<view class="progress-bar" style="width: 37.5%"></view>
			</view>
		</view>

		<view class="card">
			<view class="text-center">请记住屏幕物品，每个展示5秒</view>
			<view class="item-show">
				<view class="emoji">{{ memoryEmoji }}</view>
				<view class="item-name">{{ memoryName }}</view>
			</view>
			<view class="countdown">{{ countdownText }}</view>
		</view>

		<button class="btn" :disabled="playDisabled" @click="playMemory">
			{{ memoryFinished ? '重新播放' : '开始播放' }}
		</button>

		<button class="btn btn-next" v-show="showNextMemory" @click="handleNext">下一页</button>
	</view>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';

const props = defineProps({
	form: Object
});

const emit = defineEmits(['go', 'submit']);

// ==========================
// 全局枚举（统一）
// ==========================
const CompareType = {
	Equal: 1,
	Include: 2
};

// ======================
// 记忆库
// ======================
const memoryList = [
	{ name: '水杯', emoji: '🥛' },
	{ name: '毛巾', emoji: '🧺' },
	{ name: '苹果', emoji: '🍎' },
	{ name: '椅子', emoji: '🪑' },
	{ name: '眼镜', emoji: '👓' },
	{ name: '钥匙', emoji: '🔑' },
	{ name: '雨伞', emoji: '☂️' },
	{ name: '手表', emoji: '⌚' },
	{ name: '书本', emoji: '📖' },
	{ name: '铅笔', emoji: '✏️' },
	{ name: '帽子', emoji: '🧢' },
	{ name: '袜子', emoji: '🧦' },
	{ name: '手机', emoji: '📱' },
	{ name: '香蕉', emoji: '🍌' },
	{ name: '葡萄', emoji: '🍇' },
	{ name: '面包', emoji: '🍞' },
	{ name: '灯泡', emoji: '💡' },
	{ name: '剪刀', emoji: '✂️' },
	{ name: '纽扣', emoji: '🔘' },
	{ name: '信封', emoji: '✉️' },
	{ name: '足球', emoji: '⚽' },
	{ name: '蛋糕', emoji: '🍰' },
	{ name: '牛奶', emoji: '🥛' },
	{ name: '饼干', emoji: '🍪' },
	{ name: '床', emoji: '🛏️' },
	{ name: '勺子', emoji: '🥄' },
	{ name: '蜡烛', emoji: '🕯️' }
];

// ======================
// 统一题目配置
// ======================
const formFields = ref([
	{
		key: 'memory_items',
		label: '记忆训练物品',
		type: 'memory',
		compare_type: CompareType.Equal,
		total_score: 3,
		value: [],
		userAnswer: [],
		module: 'memory_training',
		module_name: '记忆训练'
	}
]);

// ======================
// 🔥 全局统一数组
// ======================
const questions = ref([]);

// ======================
// 状态
// ======================
const randomMemory = ref([]);
const memoryEmoji = ref('');
const memoryName = ref('准备开始');
const countdownText = ref('');
const playDisabled = ref(false);
const showNextMemory = ref(false);
const memoryFinished = ref(false);

let timer = null;

// ======================
// 工具
// ======================
const getItemByName = (name) => {
	return memoryList.find((i) => i.name === name) || {};
};

const shuffleArr = (arr) => {
	const temp = [...arr];
	for (let i = temp.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[temp[i], temp[j]] = [temp[j], temp[i]];
	}
	return temp;
};

// ======================
// 初始化随机3个物品
// ======================
const initRandomList = () => {
	const shuffled = shuffleArr(memoryList);
	const selectThree = shuffled.slice(0, 3).map((i) => i.name);
	randomMemory.value = selectThree;
	formFields.value[0].value = selectThree;
};

// ======================
// 从统一数组反显
// ======================
const initFromQuestions = () => {
	if (!props.form?.questions) return;
	questions.value = props.form.questions;

	const target = questions.value.find((q) => q.key === 'memory_items');
	if (target) {
		formFields.value[0].value = target.value || [];
		randomMemory.value = target.value || [];
	} else {
		initRandomList();
	}
};

// ======================
// 播放逻辑
// ======================
const playMemory = () => {
	clearInterval(timer);
	playDisabled.value = true;
	memoryFinished.value = false;
	showNextMemory.value = false;

	let cur = 0;
	const show = () => {
		if (cur >= 3) {
			memoryEmoji.value = '';
			memoryName.value = '完成';
			countdownText.value = '';
			memoryFinished.value = true;
			playDisabled.value = false;
			showNextMemory.value = true;
			return;
		}

		const name = randomMemory.value[cur];
		const item = getItemByName(name);
		memoryEmoji.value = item.emoji || '';
		memoryName.value = item.name || '';

		let t = 5;
		countdownText.value = t + ' 秒';

		timer = setInterval(() => {
			t--;
			countdownText.value = t + ' 秒';
			if (t <= 0) {
				clearInterval(timer);
				memoryEmoji.value = '';
				memoryName.value = '';
				cur++;
				setTimeout(show, 500);
			}
		}, 1000);
	};
	show();
};

// ======================
// ✅ 提交：写入统一数组
// ======================
const handleNext = () => {
	const field = formFields.value[0];

	const item = {
		key: field.key,
		label: field.label,
		type: field.type,
		total_score: field.total_score,
		compare_type: field.compare_type,
		value: field.value,
		userAnswer: [],
		module: field.module,
		module_name: field.module_name
	};

	const idx = questions.value.findIndex((q) => q.key === item.key);
	if (idx >= 0) questions.value[idx] = item;
	else questions.value.push(item);

	emit('submit', { questions: questions.value });
	emit('go', 'q4');
};

// ======================
// 生命周期
// ======================
onMounted(() => {
	initFromQuestions();
});

onUnmounted(() => clearInterval(timer));

watch(
	() => props.form,
	() => initFromQuestions(),
	{ deep: true }
);
</script>

<style lang="scss" scoped>
.screen {
	background: #fff;
	padding: 32rpx 32rpx;
	border-radius: 28rpx;
	box-sizing: border-box;
}

.title {
	font-size: 42rpx;
	font-weight: 700;
	text-align: center;
	color: #1d2129;
	margin-bottom: 24rpx;
}

.progress-wrap {
	margin-bottom: 40rpx;
}

.progress-text {
	font-size: 24rpx;
	color: #86909c;
	margin-bottom: 8rpx;
}

.progress {
	height: 12rpx;
	background: #f3f4f6;
	border-radius: 999rpx;
	overflow: hidden;
}

.progress-bar {
	height: 100%;
	background: linear-gradient(90deg, #3b82f6, #22c55e);
}

.card {
	background: #fafbfc;
	border-radius: 24rpx;
	padding: 40rpx 32rpx;
	margin-bottom: 40rpx;
}

.text-center {
	text-align: center;
	font-size: 28rpx;
	color: #4e5969;
	margin-bottom: 20rpx;
}

.item-show {
	width: 100%;
	min-height: 260rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 20rpx;
	background: #ffffff;
	border-radius: 20rpx;
	border: 2rpx solid #f0f2f5;
	padding: 20rpx;
	box-sizing: border-box;
}

.emoji {
	font-size: 100rpx;
	color: #3b82f6;
}

.item-name {
	font-size: 36rpx;
	font-weight: 600;
	color: #1d2129;
}

.countdown {
	text-align: center;
	font-size: 32rpx;
	color: #f53f3f;
	font-weight: 600;
	margin-top: 20rpx;
}

.btn {
	width: 100%;
	border-radius: 18rpx;
	font-size: 30rpx;
	font-weight: 600;
	margin: 16rpx 0;
	background: linear-gradient(135deg, #3b82f6, #2563eb);
	color: #fff;
	border: none;
}

.btn-next {
	background: linear-gradient(135deg, #22c55e, #16a34a);
}

.btn[disabled] {
	background: #c9cdd4;
}
</style>
