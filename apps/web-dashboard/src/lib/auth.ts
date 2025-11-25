export const isAuthenticated = (): boolean => {
  return Boolean(localStorage.getItem('auth_token'))
}

export const getToken = (): string | null => localStorage.getItem('auth_token')

export const logout = (): void => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('user_info')
}
