let user: any = null

export const auth = {
	setUser: (u: any) => (user = u),
	getUser: () => user,
	isAuth: () => !!user,
	logout: () => (user = null)
}