<template>
  <header>
    <section class="upload-list">
      <div class="item">
        <t-input-adornment>
          <template #append>
            <t-upload
              accept="image/*"
              :showUploadProgress="false"
              :useMockProgress="false"
              :autoUpload="false"
              theme="custom"
              :onChange="alipayChange"
              :trigger-button-props="{ 
                theme: 'primary', 
                variant: 'base', 
                content: alipayVal ? '重新选择支付宝收款码' : '选择支付宝收款码' 
              }"
            />
          </template>
          <t-input
            :status="alipayVal ? 'success' : ''"
            readonly
            v-model="alipayVal"
            placeholder="请上传 支付宝 收款码 👉"
          />
        </t-input-adornment>
      </div>
      <div class="item">
        <t-input-adornment>
          <template #append>
            <t-upload
              accept="image/*"
              :showUploadProgress="false"
              :useMockProgress="false"
              :autoUpload="false"
              theme="custom"
              :onChange="wechatChange"
              :trigger-button-props="{ 
                theme: 'success', 
                variant: 'base', 
                content: wechatVal ? '重新选择微信收款码' : '选择微信收款码' 
              }"
            />
          </template>
          <t-input
            :status="wechatVal ? 'success' : ''"
            readonly
            v-model="wechatVal"
            placeholder="请上传 微信 收款码 👉"
          />
        </t-input-adornment>
      </div>
      <div class="item flex">
        <t-radio-group size="small" v-model="themeStatus">
          <t-radio-button value="none">默认</t-radio-button>
          <t-radio-button value="theme_a">主题 A</t-radio-button>
          <t-radio-button value="theme_b">主题 B</t-radio-button>
          <t-radio-button value="theme_c">主题 C</t-radio-button>
          <t-radio-button value="theme_d">主题 D</t-radio-button>
        </t-radio-group>
      </div>
    </section>
    <t-card class="alipay-hide">
      <span class="title">缺省比例</span>
      <t-slider v-model="qrHideSize" :onChange="alipayHideChange" />
    </t-card>
  </header>
  <main :class="{ show: wechatQrcodeImg && alipayQrcodeImg }">
    <div class="qr-main" :class="themeStatus" ref="qrcodeDom">
      <img class="wechat-qr" :src="wechatQrcodeImg" crossorigin="anonymous" />
      <img class="alipay-qr" :src="alipayQrcodeImg" crossorigin="anonymous" />
    </div>
    <t-button theme="success" size="large" class="download-qrcode" :onClick="downloadQrcode">
      <template #icon>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <path d="M19 18a3.5 3.5 0 0 0 0 -7h-1a5 4.5 0 0 0 -11 -2a4.6 4.4 0 0 0 -2.1 8.4" />
          <path d="M12 13l0 9" />
          <path d="M9 19l3 3l3 -3" />
        </svg>
      </template>
      &nbsp;下载二维码
    </t-button>
  </main>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import html2canvas from 'html2canvas'
import jsQR from 'jsqr'
import QrCode from 'qrcode'
import { NotifyPlugin } from 'tdesign-vue-next'

//  是否美化
const themeStatus = ref<string>('none')

//  上传支付宝收款码
const alipayFileList = ref<any>()
const alipayVal = ref<any>()
const alipayQrcodeImg = ref<string>()
// 支付宝收款码白名单
const alipayWhiteList = ['alipay.com']
const alipayChange = async (v: any) => {
  const currentFile = v && v.length ? v[0].raw : alipayFileList.value
  if (!currentFile) return
  const res = await loadImg(currentFile)
  if (!res) {
    return NotifyPlugin.error({
      title: 'Error',
      content: '无法识别二维码内容',
    })
  }
  
  // 如果包含微信特征, 则自动填入微信输入框
  if (wechatWhiteList.some((i: string) => String(res).toLowerCase().includes(i))) {
    wechatFileList.value = currentFile
    wechatVal.value = String(res)
    wechatQrcodeImg.value = await drawQR(wechatVal.value)
    showQrcode()
    return
  }
  
  // 其他情况默认为支付宝收款码
  alipayFileList.value = currentFile
  alipayVal.value = String(res)
  alipayQrcodeImg.value = await drawQR(alipayVal.value, true)
  showQrcode()
}

// 上传微信
const wechatFileList = ref<any>()
const wechatVal = ref<any>()
const wechatQrcodeImg = ref<string>()
// 微信收款码白名单
const wechatWhiteList = ['wxp://', 'weixin.qq.com', 'wechatpay.cn']
const wechatChange = async (v: any) => {
  const currentFile = v && v.length ? v[0].raw : wechatFileList.value
  if (!currentFile) return
  const res = await loadImg(currentFile)
  if (!res) {
    return NotifyPlugin.error({
      title: 'Error',
      content: '无法识别二维码内容',
    })
  }

  // 如果包含支付宝特征, 则自动填入支付宝输入框
  if (alipayWhiteList.some((i: string) => String(res).toLowerCase().includes(i))) {
    alipayFileList.value = currentFile
    alipayVal.value = String(res)
    alipayQrcodeImg.value = await drawQR(alipayVal.value, true)
    showQrcode()
    return
  }

  // 其他情况默认为微信收款码
  wechatFileList.value = currentFile
  wechatVal.value = String(res)
  wechatQrcodeImg.value = await drawQR(wechatVal.value)
  showQrcode()
}

// 支付宝隐藏比例
const qrHideSize = ref<number>(50)
const alipayHideChange = (v: any) => {
  qrHideSize.value = v
  alipayChange(null)
}

// 生成二维码
const showQrcode = async () => {
  if (!alipayQrcodeImg.value || !wechatQrcodeImg.value) return
}

// 加载图片
const loadImg = (file: any) => {
  if (!file) return
  const reader = new FileReader()
  reader.readAsDataURL(file)
  return new Promise((resolve) => {
    reader.onload = (e) => {
      const image = new Image()
      image.src = e.target!.result as any
      image.onload = () => {
        const code = qrcodeResult(image)
        resolve(code)
      }
    }
  })
}

//  识别二维码
const qrcodeResult = (image: any) => {
  const canvas = document.createElement('canvas')
  const context: any = canvas.getContext('2d')
  canvas.width = image.width
  canvas.height = image.height
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const decodedResult = jsQR(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: 'dontInvert',
  })
  return decodedResult?.data
}

// 添加清除右上角的函数
const qrcodeDom = ref<any>()
const qrSize = ref<number>(0)
const drawQR = async (qrValue: string, hide: boolean = false) => {
  const qrDom = document.createElement('canvas')
  await QrCode.toCanvas(qrDom, qrValue, {
    errorCorrectionLevel: 'H',
    width: qrSize.value,
    margin: 0,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  })
  if (hide) {
    const ctx: any = qrDom.getContext('2d')
    const clearWidth = (qrSize.value / 2) * (qrHideSize.value / 100)
    ctx.clearRect(qrSize.value / 2, qrSize.value - clearWidth, qrSize.value / 2, clearWidth)
  }
  return qrDom.toDataURL('image/png')
}

// 下载二维码
const downloadQrcode = async () => {
  const canvas = await html2canvas(qrcodeDom.value, { useCORS: true })
  const dataURL = canvas.toDataURL('image/png')
  const link = document.createElement('a')
  link.href = dataURL
  link.download = 'PayQrcode.png'
  link.click()
}

onMounted(() => {
  qrSize.value = qrcodeDom.value!.clientWidth
})
</script>
<style lang="less" scoped>
@import url('./Main.less');
</style>
