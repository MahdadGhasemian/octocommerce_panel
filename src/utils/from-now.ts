// ** Import libraries
import momentjalaali from 'moment-jalaali'
import moment from 'moment-timezone'

export const fromNow = (date: Date) => {
  const inputTime = moment.utc(date)
  const currentTime = moment.utc()

  const diffInMinutes = currentTime.diff(inputTime, 'minutes')

  if (diffInMinutes < 60) {
    return `${diffInMinutes} دقیقه پیش`
  } else if (diffInMinutes < 1440) {
    return `${Math.floor(diffInMinutes / 60)} ساعت پیش`
  } else if (inputTime.isSame(currentTime, 'd')) {
    return `امروز - ${inputTime.format('HH:mm')}`
  } else if (inputTime.isSame(currentTime.clone().subtract(1, 'd'), 'd')) {
    return `دیروز - ${inputTime.format('HH:mm')}`
  } else {
    return momentjalaali(inputTime).format('jMM/jDD - HH:mm')
  }
}

export const diffInDay = (date1: Date | string, date2: Date | string) => {
  const inputDate1 = momentjalaali(date1).startOf('day')
  const inputDate2 = momentjalaali(date2).startOf('day')

  return inputDate1.diff(inputDate2, 'days')
}
