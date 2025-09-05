import { BrowserEnum, OsEnum } from '@/services'

export const BROWSER_MAP: Record<BrowserEnum, string> = {
  [BrowserEnum.Chrome]: 'Chrome',
  [BrowserEnum.Firefox]: 'Firefox',
  [BrowserEnum.Safari]: 'Safari',
  [BrowserEnum.Edge]: 'Edge',
  [BrowserEnum.Opera]: 'Opera',
} as const

export const OS_MAP: Record<OsEnum, string> = {
  [OsEnum.Windows10]: 'Windows 10',
  [OsEnum.Windows11]: 'Windows 11',
  [OsEnum.Macos]: 'macOS',
  [OsEnum.Linux]: 'Linux',
  [OsEnum.Android]: 'Android',
  [OsEnum.Ios]: 'iOS',
} as const

export const snakeToTitle = (str: string): string => {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const formatConfiguration = (str: string): string => {
  const words = str.split(' ')
  const [browser, , os] = words

  const formattedBrowser = BROWSER_MAP[browser as BrowserEnum] ?? browser
  const formattedOs = OS_MAP[os as OsEnum] ?? os

  return `${formattedBrowser} on ${formattedOs}`
}

export const getAttachmentFileName = (filePath: string) => {
  return filePath.split('?')[0].split('/').pop() || 'unknown'
}
