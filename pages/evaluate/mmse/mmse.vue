<template>
	<view class="container">
		<Page1Home v-if="currentPage === 1" @go="go" @init-random="initRandom" />

		<Page2Info v-if="currentPage === 'q0'" :form="form" @go="go" @submit="save" />

		<Page3Time v-if="currentPage === 'q1'" :form="form" @go="go" @submit="save" />

		<Page4Place v-if="currentPage === 'q2'" :form="form" @go="go" @submit="save" />

		<Page5Memory v-if="currentPage === 'q3'" :form="form" @go="go" @submit="save" />

		<Page6Calc v-if="currentPage === 'q4'" :form="form" @go="go" @submit="save" />

		<Page7Delay v-if="currentPage === 'q5'" :form="form" @go="go" @submit="save" />

		<Page8Language v-if="currentPage === 'q6'" :form="form" @go="go" @submit="save" />

		<Page9Command v-if="currentPage === 'q7'" :form="form" @go="go" @submit="save" />

		<Page10Draw v-if="currentPage === 'q8'" :form="form" @go="go" @submit="save" @save="result" />

		<Page11Result v-if="currentPage === 'result'" :form="form" @reset="reset" />
	</view>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { onShow, onLoad } from '@dcloudio/uni-app';
import Page1Home from './components/Page1Home.vue';
import Page2Info from './components/Page2Info.vue';
import Page3Time from './components/Page3Time.vue';
import Page4Place from './components/Page4Place.vue';
import Page5Memory from './components/Page5Memory.vue';
import Page6Calc from './components/Page6Calc.vue';
import Page7Delay from './components/Page7Delay.vue';
import Page8Language from './components/Page8Language.vue';
import Page9Command from './components/Page9Command.vue';
import Page10Draw from './components/Page10Draw.vue';
import Page11Result from './components/Page11Result.vue';

import { Request } from '@/api/request.js';
// 当前页面
const currentPage = ref(1);

// 表单
const form = reactive({});

// 初始化随机
const initRandom = () => {};

// ==============================================
// 统一保存
// ==============================================
const save = (value) => {
	console.log('保存表单:', JSON.parse(JSON.stringify(value)));
	Object.assign(form, value);
	uni.setStorageSync('eval_form', form);
	uni.setStorageSync('eval_page', currentPage.value);
};

// ==============================================
// 页面切换 + 缓存进度
// ==============================================
const go = (id) => {
	currentPage.value = id;
	uni.setStorageSync('eval_page', id);
};

// ==============================================
// 每次显示页面都恢复缓存（核心！）
// ==============================================
const loadCache = () => {
	// 恢复表单
	const savedForm = uni.getStorageSync('eval_form');
	if (savedForm) {
		Object.assign(form, savedForm);
	}
	console.log('savedForm', savedForm);
	// 恢复页面
	const savedPage = uni.getStorageSync('eval_page');
	if (savedPage) {
		currentPage.value = savedPage;
	}
};

// ==============================================
// 打开 & 重新显示 都恢复
// ==============================================
onMounted(() => {
	initRandom();
});
const id = ref(0);
onLoad((parmas) => {
	id.value = parmas.id;
});

const result = () => {
	Request('POST', '/api/follow-up-results', {
		follow_up_plan_id: id.value,
		data: JSON.stringify(form)
	}).then((res) => {
		console.log(res);
	});
};
// 每次从后台切回来、从别的页返回，都会执行
onShow(() => {
	loadCache();
});

// 重置（清空缓存）
const reset = () => {
	// 清空内存
	Object.keys(form).forEach((k) => delete form[k]);
	// 清空本地缓存
	uni.removeStorageSync('eval_form');
	uni.removeStorageSync('eval_page');

	initRandom();
	currentPage.value = 1;
};
</script>

<style lang="scss" scoped>
.container {
	background: #fff8f2;
	min-height: 100vh;
	padding: 24rpx;
}
</style>
