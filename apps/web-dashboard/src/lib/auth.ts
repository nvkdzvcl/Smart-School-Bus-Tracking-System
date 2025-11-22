export const isAuthenticated = (): boolean => {
  return Boolean(localStorage.getItem('token'))
}

export const getToken = (): string | null => localStorage.getItem('token')

export const logout = (): void => {
  localStorage.removeItem('token')
  localStorage.removeItem('user_info')
}
