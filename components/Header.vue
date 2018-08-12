<template>
	<div>
		<!-- <span v-on:click="logout()" class="nav-text">logout</span> -->
		
	</div>
</template>


<script>
export default {
  props: ["artistBubbles"],
  data() {
    return {
      svg_images: []
    };
  },
  methods: {
    logout: function() {
      this.$store.commit("store_user", {});
      this.$router.push("/");
      sessionStorage.clear();
    }
  }
};
</script>
<style scoped>
.menu-options {
  width: 100%;
  text-align: left;
  padding: 10px;
}

.nav-text {
  font-size: 10px;
  display: block;
  cursor: pointer;
  text-decoration: underline;
}
</style>