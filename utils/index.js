/**
 * 将秒数转换为小时和分钟
 * @param {Number} seconds 秒数
 * @returns {String} 返回格式化后的时间字符串，例如"00:00:00"
 */
export const formatSeconds = (seconds, bool = false) => {
	// 取整，避免小数秒
	seconds = Math.floor(seconds || 0)

	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)
	const remainingSeconds = seconds % 60

	// 补零格式化
	const formattedHours = hours.toString().padStart(2, '0')
	const formattedMinutes = minutes.toString().padStart(2, '0')
	const formattedSeconds = remainingSeconds.toString().padStart(2, '0')

	if (bool) {
		return `${formattedMinutes}:${formattedSeconds}`
	}
	return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
}