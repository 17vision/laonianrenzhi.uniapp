<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
	page,
	.container {
		display: flex;
		flex-direction: column;
		width: 750upx;
		min-height: 100vh;
	}

	@import '@/static/css/base.scss';
	@import '@/static/css/app.scss';
	@import '@/static/css/icon.scss';
</style>