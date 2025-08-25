export const snakeToTitle = (str: string): string => {
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const formatConfiguration = (str: string): string => {
  const browserMap: Record<string, string> = {
    chrome: 'Chrome',
    firefox: 'Firefox',
    safari: 'Safari',
    edge: 'Edge',
    opera: 'Opera',
  }

  const osMap: Record<string, string> = {
    windows10: 'Windows 10',
    windows11: 'Windows 11',
    macos: 'macOS',
    linux: 'Linux',
    android: 'Android',
    ios: 'iOS',
  }

  const words = str.split(' ')
  const [browser, , os] = words

  const formattedBrowser = browserMap[browser] ?? browser
  const formattedOs = osMap[os] ?? os

  return `${formattedBrowser} on ${formattedOs}`
}

export const getAttachmentFileName = (filePath: string) => {
  return filePath.split('?')[0].split('/').pop() || 'unknown'
}
