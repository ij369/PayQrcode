import { ref, watch } from 'vue'
import { ConfigProvider } from 'tdesign-vue-next'

export type ThemeMode = 'light' | 'dark' | 'system'

// 定义主题色
const themeColors = {
    light: '#eeeeee',
    dark: '#242424'
}

export const useTheme = () => {
    const currentTheme = ref<ThemeMode>('system')
    const activeTheme = ref<'light' | 'dark'>('light')

    // 检测系统主题
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')

    // 获取系统当前主题
    const getSystemTheme = (): 'light' | 'dark' => {
        return prefersDark.matches ? 'dark' : 'light'
    }

    // 更新theme-color meta标签
    const updateThemeColor = (theme: 'light' | 'dark') => {
        let themeColorMeta = document.querySelector('meta[name="theme-color"]')
        if (!themeColorMeta) {
            themeColorMeta = document.createElement('meta')
            themeColorMeta.setAttribute('name', 'theme-color')
            document.head.appendChild(themeColorMeta)
        }
        themeColorMeta.setAttribute('content', themeColors[theme])
    }

    // 应用主题
    const applyTheme = (theme: 'light' | 'dark') => {
        activeTheme.value = theme
        document.documentElement.setAttribute('theme-mode', theme)
        ConfigProvider.global({ theme })
        updateThemeColor(theme)
    }

    // 更新主题
    const updateTheme = (mode: ThemeMode) => {
        currentTheme.value = mode
        localStorage.setItem('theme-mode', mode)

        if (mode === 'system') {
            applyTheme(getSystemTheme())
        } else {
            applyTheme(mode)
        }
    }

    // 监听系统主题变化
    prefersDark.addEventListener('change', (e) => {
        if (currentTheme.value === 'system') {
            applyTheme(e.matches ? 'dark' : 'light')
        }
    })

    // 监听主题变化
    watch(activeTheme, (newTheme) => {
        updateThemeColor(newTheme)
    }, { immediate: true })

    // 初始化主题
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme-mode') as ThemeMode
        if (savedTheme) {
            updateTheme(savedTheme)
        } else {
            updateTheme('system')
        }
    }

    return {
        currentTheme,
        activeTheme,
        updateTheme,
        initTheme
    }
}