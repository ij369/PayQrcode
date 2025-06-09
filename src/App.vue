<template>
  <header class="header">
    <section class="main">
      <h1>
        PayQrcode
      </h1>
      <t-tabs
        v-model="currentTheme"
        size="small"
        class="theme-tabs"
        theme="card"
        @change="handleThemeChange"
      >
        <t-tab-panel value="light">
          <template #label>
            <t-space>
              <t-icon name="brightness" />
              浅色
            </t-space>
          </template>
        </t-tab-panel>
        <t-tab-panel value="dark">
          <template #label>
            <t-space>
              <t-icon name="moon" />
              深色
            </t-space>
          </template>
        </t-tab-panel>
        <t-tab-panel value="system">
          <template #label>
            <t-space>
              <t-icon name="desktop" />
              系统
            </t-space>
          </template>
        </t-tab-panel>
      </t-tabs>
    </section>
  </header>
  <main>
    <h2>二合一收款码物理合并版</h2>
    <t-space direction="vertical">
      <t-alert theme="success">
        <template #icon></template>
        <template #message>
          <p>
            ✅ 物理合并，直接将
            图片合并成一张图片，无需服务器，不怕被篡改，可打印使用，稳定，绿色，安全！
          </p>
          <p>⚠️ 全程离线运行，二维码解析合并无任何更改，且项目开源，请放心食用！</p>
        </template>
      </t-alert>
      <t-alert theme="warning" message="请尽量把非二维码区域裁剪后上传，以提升识别准确性！" />
    </t-space>
    <Main />
  </main>
  <footer class="footer">
    <p class="footer-text">
      <t-icon name="logo-github" class="github-icon" title="github-link"/>&nbsp;
      <t-link theme="primary" underline href="https://github.com/uxiaohan/PayQrcode" target="_blank">本项目</t-link> 基于开源项目
      <t-link theme="primary" underline href="https://github.com/uxiaohan/PayQrcode" target="_blank">uxiaohan/PayQrcode</t-link>
      二次修改, 均可在本地浏览器实现离线生成。
    </p>
  </footer>
</template>

<script lang="ts" setup>
import Main from '@/components/Main/Main.vue'
import { onMounted } from 'vue'
import { useTheme, type ThemeMode } from '@/composables/useTheme'

const { currentTheme, updateTheme, initTheme } = useTheme()

// 初始化主题
onMounted(() => {
  initTheme()
})

// 监听主题变化
const handleThemeChange = (value: ThemeMode) => {
  updateTheme(value)
}
</script>
