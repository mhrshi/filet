module.exports = {
	presets: [
		["@babel/preset-env", {
			"modules": false
    	}]
    ],
  	plugins: [
		"transform-vue-jsx",
		"syntax-jsx",
		"@babel/plugin-transform-runtime"
	]
}
