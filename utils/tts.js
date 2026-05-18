const plugin =
	requirePlugin('WechatSI')

let audio =
	uni.createInnerAudioContext()

export const playTTS =
	(text) => {

		plugin.textToSpeech({

			lang: 'zh_CN',

			tts: true,

			content: text,

			success(res) {

				audio.stop()

				audio.src =
					res.filename

				audio.play()
			}
		})
	}