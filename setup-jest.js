import $ from 'jquery'
global.$ = global.jQuery = $

window.getComputedStyle = () => ({
	getPropertyValue: () => '',
})
