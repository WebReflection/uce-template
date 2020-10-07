const template = `
<my-counter>
	<button onclick="{{dec}}">
    -
  </button>
	<span>{{state.count}}</span>
	<button onclick="{{inc}}">
    +
  </button>
</my-counter>

<script type="module">
	import reactive from "@uce/reactive";
  export default {
    setup(element) {
      const state = reactive({ count: 0 });
      const inc = () => {
        state.count++;
      };
      const dec = () => {
        state.count--;
      };
      return { state, inc, dec };
    },
  };
</script>

<style scoped>
	* {
		font-size: 200%;
	}

	span {
		width: 4rem;
		display: inline-block;
		text-align: center;
	}

	button {
		width: 4rem;
		height: 4rem;
		border: none;
		border-radius: 10px;
		background-color: seagreen;
		color: white;
	}
</style>`;

customElements
  .whenDefined("uce-template")
  .then(Template =>
    document.body.insertAdjacentElement("beforeend", Template.from(template))
  );