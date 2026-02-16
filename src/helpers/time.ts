import dayjs from 'dayjs'
import { locale } from '~/i18n'

export const formatTimeFromNow = (time: number | string) =>
  dayjs(time).locale(locale()).fromNow()

export const formatTime = (time: number | string) =>
  dayjs(time).locale(locale()).format('YYYY-MM-DD HH:mm:ss')
