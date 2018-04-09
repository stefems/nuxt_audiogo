import Vuex from 'vuex'


const createStore = () => {
	return new Vuex.Store({
	  state: {
		counter: 0,
		user: {}
	  },
	  mutations: {
		increment (state) {
		  state.counter++
		},
		store_user(state, user) {
			state.user = user;
			sessionStorage.setItem("showgo_user", JSON.stringify(user));
		}
	  }
	})
  }
  
  export default createStore