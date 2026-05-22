<script>
import islogin from '@/api/login.js';
export default {
	async onLaunch() {
		await islogin();
	},

	onShow() {},
	onHide() {}
};
</script>

<style lang="scss">
@import '@/static/css/base.scss';
@import '@/static/css/app.scss';

page,
.container {
	display: flex;
	flex-direction: column;
	width: 750upx;
	min-height: 100vh;
	box-sizing: border-box;
	background-color: #FFF8F2;
}
</style>
