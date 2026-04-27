 class AuthService {
	#token;
	constructor(){
		this.#token = (window.NOW && window.NOW.user_token) || window.g_ck || '';
	}

	 get token() {
		 return this.#token;
	 } 
}
const authService = new AuthService(); 
export default authService;
