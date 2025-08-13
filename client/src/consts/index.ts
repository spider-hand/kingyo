import {
  BrowserEnum,
  ListTestplansStatusEnum,
  ListTestplansTestcasesLatestResultEnum,
  ListTestplansTestcasesStatusEnum,
  OsEnum,
} from '@/services'
import { formatConfiguration, snakeToTitle } from '@/utils'

export const TEST_PLAN_STATUS_OPTIONS = [
  ...Object.values(ListTestplansStatusEnum).map((value) => ({
    value,
    label: snakeToTitle(value),
  })),
] as const

export const TEST_CASE_STATUS_OPTIONS = [
  ...Object.values(ListTestplansTestcasesStatusEnum).map((value) => ({
    value,
    label: snakeToTitle(value),
  })),
] as const

export const TEST_CASE_LATEST_RESULT_OPTIONS = [
  ...Object.values(ListTestplansTestcasesLatestResultEnum).map((value) => ({
    value,
    label: snakeToTitle(value),
  })),
] as const

export const TEST_CASE_RESULT_CONFIGURATION_OPTIONS = [
  ...Object.values(BrowserEnum).flatMap((browser) =>
    Object.values(OsEnum).map((os) => ({
      value: `${browser} on ${os}`,
      label: formatConfiguration(`${browser} on ${os}`),
    })),
  ),
] as const
