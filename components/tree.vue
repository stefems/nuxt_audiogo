<template>
	<svg viewBox="0 15 208 313" class="path" ref="svg" xmlns="http://www.w3.org/2000/svg">
		<!-- Created with Method Draw - http://github.com/duopixel/Method-Draw/ -->
		<g>
		<title>background {{ab}}</title>
		<rect fill="#fff" id="canvas_background" height="315" width="210" y="-1" x="-1"/>
		<g display="none" overflow="visible" y="0" x="0" height="100%" width="100%" id="canvasGrid">
		<rect fill="url(#gridpattern)" stroke-width="0" y="0" x="0" height="100%" width="100%"/>
		</g>
		</g>
		<g>
		<title>Layer 1</title>
		<line stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_5" y2="164" x2="69.5" y1="201" x1="101.5" stroke-width="4" stroke="blue" fill="none"/>
		<line stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_3" y2="75" x2="102" y1="290" x1="101" stroke-width="4" stroke="green" fill="none"/>
		<line stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_4" y2="157" x2="151" y1="229" x1="101.5" stroke-width="4" stroke="red" fill="none"/>

		<defs>
			<pattern id="pattern0" x="0" y="0" patternUnits="objectBoundingBox" height="1" width="1">
			<image class="image_src" x="0" y="0" fill="white" xlink:href=""></image>
			</pattern>
		</defs>
		<defs>
			<pattern id="pattern1" x="0" y="0" patternUnits="objectBoundingBox" height="1" width="1">
			<image class="image_src" x="0" y="0" xlink:href=""></image>
			</pattern>
		</defs>
		<defs>
			<pattern id="pattern2" x="0" y="0" patternUnits="objectBoundingBox" height="1" width="1">
			<image class="image_src" x="0" y="0" xlink:href=""></image>
			</pattern>
		</defs>
		<circle class="image_circles" cy="142.999999" cx="50.999999" r="38" fill="white" stroke="#000" stroke-width="4"/>
		<circle class="image_circles" cy="141.999999" cx="157.999999" r="38" fill="white" stroke="#000" stroke-width="4"/>
		<circle class="image_circles" cy="59.999999" cx="100.999999" r="38" fill="white" stroke="#000" stroke-width="4"/>
		<circle v-on:click="emit_open_stream($event)" class="transparent" cy="142.999999" cx="50.999999" r="38" fill="white" stroke="#000" stroke-width="4"/>
		<circle class="transparent" cy="141.999999" cx="157.999999" r="38" fill="white" stroke="#000" stroke-width="4"/>
		<circle class="transparent" cy="59.999999" cx="100.999999" r="38" fill="white" stroke="#000" stroke-width="4"/>
		
		</g>
	</svg>
</template>

<script>
export default {
	name: 'my-tree',
	props: ["artistBubbles"],
	data() {
		return {
			svg_images: [],
			svg_circles: [],
			transparents : [],
			tree_filled: false
		};
	},
	computed: {
		ab: function() {
			return this.artistBubbles;
		}
	},
	methods: {
		emit_open_stream: function(event) {
			console.log(this.$refs.svg.getElementsByTagName("line"));
			let lines = this.$refs.svg.getElementsByTagName("line");
			lines[0].setAttribute("transform-origin", "50% 50%");
			lines[0].setAttribute("transform", "rotate(41) translate(38)");
			// lines[0].setAttribute("transform", "translate(20)");
			// lines[2].setAttribute("transform", "rotate(-5)");
			// this.$emit("openstream", event.target.getAttribute("artist_id"));
		}
	},
	mounted() {
		this.svg_images = this.$refs.svg.getElementsByClassName("image_src");
		this.svg_circles = this.$refs.svg.getElementsByClassName("image_circles");
		this.transparents = this.$refs.svg.getElementsByClassName("transparent");
	},
	updated() {
		if (this.artistBubbles && !this.tree_filled) {
			this.tree_filled = true;
			let image_promises = [];
			for (let i = 0; i < this.artistBubbles.length; i++) {
				image_promises.push(getMeta(this.artistBubbles[i]));
			}
			Promise.all(image_promises).then(function(results) {
				for (let i = 0; i < this.artistBubbles.length; i++) {
					if (results[i].image_size.width > results[i].image_size.height) {
						this.svg_images[i].setAttribute("height", "76");
					}
					else if (results[i].image_size.width < results[i].image_size.height) {
						this.svg_images[i].setAttribute("width", "76");
					}
					else {
						this.svg_images[i].setAttribute("width", "76");
						this.svg_images[i].setAttribute("height", "76");
					}
					
					this.svg_circles[i].setAttribute("fill", "url(#pattern" + i + ")");
					this.transparents[i].setAttribute("artist_id", this.artistBubbles[i].id);
					this.transparents[i].setAttribute("fill", "rgba(0,0,0,0)");
					this.svg_images[i].setAttribute("xlink:href", this.artistBubbles[i].url);
					
				}
			}.bind(this));
		}

		function getMeta(image) {
			let size_promise = new Promise( (resolve) => {
				var img = new Image();
				img.addEventListener("load", function(){
					image.image_size = {height: this.naturalHeight, width: this.naturalWidth};
					resolve(image);
				});
				img.src = image.url;
			});
			return size_promise;
		}
	}
};
</script>
<style scoped>
svg {
	max-height: 100%;
	margin-bottom: -36px;
}
.transparent {
	transition: fill 1s ease;
}
@keyframes dash {

  from {
    stroke-dashoffset: 1000;
  }
  to {
    stroke-dashoffset: 0;
  }
}
.rotated {
	transition: transform 1s ease;
	transform: rotate(45);
}
line {
	transition: transform .5s linear;
}
.path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 0;
  animation: dash 3.5s ease 1;
  animation-fill-mode: backwards;
}
ellipse {
	z-index: 1;
	position: relative;
}
</style>