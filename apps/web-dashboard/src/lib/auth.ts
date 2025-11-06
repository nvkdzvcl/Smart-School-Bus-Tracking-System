export const isAuthenticated = (): boolean => {
  return Boolean(localStorage.getItem('ssb_auth'))
}

export const logout = (): void => {
  localStorage.removeItem('ssb_auth')
}
