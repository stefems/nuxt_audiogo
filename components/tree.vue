<template>
	<svg viewBox="0 15 208 313" class="path" ref="svg" xmlns="http://www.w3.org/2000/svg">
		<!-- Created with Method Draw - http://github.com/duopixel/Method-Draw/ -->
		<g>
		<title>background {{artistBubbles.length}} </title>
		<rect fill="#fff" id="canvas_background" height="315" width="210" y="-1" x="-1"/>
		<g display="none" overflow="visible" y="0" x="0" height="100%" width="100%" id="canvasGrid">
		<rect fill="url(#gridpattern)" stroke-width="0" y="0" x="0" height="100%" width="100%"/>
		</g>
		</g>
		<g>
		<title>Layer 1</title>
		<line stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_3" y2="75" x2="102" y1="290" x1="101" stroke-width="4" stroke="#000" fill="none"/>
		<line stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_4" y2="157" x2="151" y1="229" x1="101.5" stroke-width="4" stroke="#000" fill="none"/>
		<line stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_5" y2="164" x2="69.5" y1="201" x1="101.5" stroke-width="4" stroke="#000" fill="none"/>

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
		<circle class="transparent" cy="142.999999" cx="50.999999" r="38" fill="white" stroke="#000" stroke-width="4"/>
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
			sv_circles: [],
			transparents : []
		};
	},
	mounted() {
		console.log("mounted");
		this.svg_images = this.$refs.svg.getElementsByClassName("image_src");
		this.svg_circles = this.$refs.svg.getElementsByClassName("image_circles");
		this.transparents = this.$refs.svg.getElementsByClassName("transparent");
	},
	watch: {
		artistBubbles: function(new_b, old_b) {
			console.log(new_b);
		}
	},
	updated() {
		console.log(this.artistBubbles);
		let image_promises = [];
		for (let i = 0; i < this.artistBubbles.length; i++) {
			image_promises.push(getMeta(this.artistBubbles[i]));
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

		Promise.all(image_promises).then( (results) => {
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
				this.transparents[i].setAttribute("fill", "rgba(0,0,0,0)");
				this.svg_images[i].setAttribute("xlink:href", this.artistBubbles[i].url);
			}
		});
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
.path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: dash 3s ease 1;
  animation-fill-mode: forwards;
}
ellipse {
	z-index: 1;
	position: relative;
}
</style>