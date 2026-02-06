// i18n/index.ts
import { createI18n } from 'vue-i18n'
// dayjs
// import dayjs from 'dayjs'


// 使用 Vite 的 glob 导入加载所有语言文件
const localeModules = import.meta.glob('./locales/*.json', { eager: true })

// 构建 messages 对象
const messages: Record<string, any> = {}
for (const path in localeModules) {
  const match = path.match(/\.\/locales\/(.+)\.json$/)
  const locale = match?.[1]
  if (locale) {
    const localeData = (localeModules[path] as any).default
    messages[locale] = localeData
    
    // 添加简写别名（zh-CN -> zh, en-US -> en）
    const shortLocale = locale.split('-')[0]
    if (shortLocale && !messages[shortLocale]) {
      messages[shortLocale] = localeData
    }
  }
}

// 从localStorage读取用户语言偏好
function getDefaultLocale(): string {
  const saved = localStorage.getItem('user-locale')
  if (saved) return saved
  
  // 检测浏览器语言
  const browserLang = navigator.language || (navigator as any).userLanguage
  
  // 支持的语言列表
  const supportedLocales = ['zh-CN', 'en-US', 'ja-JP', 'ko-KR', 'ar-SA']
  
  // 精确匹配
  if (supportedLocales.includes(browserLang)) {
    return browserLang
  }
  
  // 模糊匹配（如 zh-TW 匹配到 zh-CN）
  const langPrefix = browserLang.split('-')[0]
  const matched = supportedLocales.find(locale => locale.startsWith(langPrefix))
  
  return matched || 'zh-CN'
}

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getDefaultLocale(),
  fallbackLocale: {
    'zh': ['zh-CN'],
    'en': ['en-US'],
    'ja': ['ja-JP'],
    'ko': ['ko-KR'],
    'default': ['zh-CN']
  },
  messages,
  globalInjection: true, // 全局注入 $t 方法
  
  // 缺失翻译处理
  missing: (locale: string, key: string) => {
    console.warn(`[i18n] Missing translation for key: ${key} in locale: ${locale}`)
    // 上报到监控系统
    reportMissingTranslation(locale, key)
    return key
  },
  
  // 数字格式化
  numberFormats: {
    'zh-CN': {
      currency: {
        style: 'currency',
        currency: 'CNY'
      }
    },
    'en-US': {
      currency: {
        style: 'currency',
        currency: 'USD'
      }
    }
  },
  
  // 日期时间格式化
  datetimeFormats: {
    'zh-CN': {
      short: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }
    },
    'en-US': {
      short: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }
    }
  }
})

// 上报缺失翻译
function reportMissingTranslation(_locale: string, _key: string): void {
  // 实际项目中可以对接监控平台
  if (import.meta.env.PROD) {
    // fetch('/api/log/missing-translation', { ... })
  }
}

// 动态加载语言包（使用懒加载方式）
const lazyLocaleModules = import.meta.glob('./locales/*.json')

export async function loadLocaleMessages(locale: string): Promise<any> {
  try {
    const loadLocale = lazyLocaleModules[`./locales/${locale}.json`]
    if (!loadLocale) {
      throw new Error(`Locale ${locale} not found`)
    }
    const messages = await loadLocale()
    i18n.global.setLocaleMessage(locale, (messages as any).default)
    return (messages as any).default
  } catch (error) {
    console.error(`Failed to load locale: ${locale}`, error)
    throw error
  }
}

// 切换语言
export async function changeLocale(locale: string): Promise<void> {
  // 检查语言包是否存在
  if (!i18n.global.availableLocales.includes(locale as any)) {
    throw new Error(`Locale ${locale} is not available`)
  }
  
  i18n.global.locale.value = locale as any
  localStorage.setItem('user-locale', locale)
  document.documentElement.lang = locale
  
  // 切换dayjs locale（如果使用了 dayjs）
  try {
    await import(/* @vite-ignore */ `dayjs/locale/${locale.toLowerCase()}`)
  } catch {
    // dayjs locale not found, ignore
  }
}

export default i18n