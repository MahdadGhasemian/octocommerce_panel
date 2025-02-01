/**
 ** Mobile Phone Validation
 */
export const validateMobileNumber = (phone: string): boolean => {
  const mobileNumberPattern = /^0\d{0,10}$/

  return mobileNumberPattern.test(phone)
}

export const validateMobileNumberFull = (phone: string): boolean => {
  const mobileNumberPattern = /^0\d{10}$/

  return mobileNumberPattern.test(phone)
}
