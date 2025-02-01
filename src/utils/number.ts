const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
const latinDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

/**
 ** Convert Persian digits to Latin digits for parsing
 */
export const persianToLatinDigits = (input: string | number): number => {
  return parseInt(String(input).replace(/[۰-۹]/g, char => latinDigits[persianDigits.indexOf(char)]))
}

export const replacePersianNumbers = (input: string): string => {
  return input.replace(/[۰-۹]/g, char => {
    const index = persianDigits.indexOf(char)

    return latinDigits[index]
  })
}

export const addIranCountryCode = (phoneNumber: string): string => {
  return `+98${phoneNumber.replace(/^0+/, '')}`
}

export const fixedMobileNumber = (phoneNumber: string): string => {
  return addIranCountryCode(replacePersianNumbers(phoneNumber))
}
