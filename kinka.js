(()=>{
	'use strict'

	const ASSET_FILE = "spritesheet.png"
	const BIRD_SIZE = 50
	const BIRD_BOTTOM_OFFSET = 10
	const FLY_SPEED = 200
	const WALK_SPEED = 80
	const SPLITE_NONE = 0
	const SPLITE_STAY = 1
	const SPLITE_WALK = 2
	const SPLITE_FLY_UP = 3
	const SPLITE_FLY_DOWN = 4

	let CURRENT_PATH = ""
	let birds = []
	let perches = []

	// Util Function
	let pxTrim = (str) => {
		return Number(str.substring(0, str.lastIndexOf('px')))
	}

	let getCurrentJsPath = () => {
		if (!CURRENT_PATH) {
			let path = ""
			if (document.currentScript) {
				path = document.currentScript.src
			} else {
				let scripts = document.getElementsByTagName('script')
				if (scripts[scripts.length-1].src) {
					path = script.src;
				}
			}
			CURRENT_PATH = path.substring(0, path.lastIndexOf('/'))
		}
		return CURRENT_PATH
	}
	getCurrentJsPath()

	// 止まり木のクラス
	class Perch {
		constructor(element) {
			this.el = element
		}

		getTarget() {
			return({top : this.el.offsetTop - BIRD_SIZE + BIRD_BOTTOM_OFFSET ,
					left: this.el.offsetLeft + (this.el.offsetWidth * Math.random() - BIRD_SIZE / 2)})
		}
	}

	class Bird {
		constructor(element) {
			this.p = 0
			// Set Styles
			this.el = element
			this.el.style.position = "absolute"
			this.el.style.top = Math.random() * window.innerHeight + 'px'
			this.el.style.left = Math.random() * window.innerWidth + 'px'
			this.el.style.width = BIRD_SIZE + 'px'
			this.el.style.height = BIRD_SIZE + 'px'
			this.el.style.zIndex = "10000"
			this.el.style.backgroundImage = `url(${CURRENT_PATH}/${ASSET_FILE})`
			this.el.style.backgroundSize = `auto ${BIRD_SIZE}px`
			this.el.style.backgroundPosition = `0px 0px`
			this.el.style.backfaceVisibility = "hidden"

			this.el.style.transitionTimingFunction = "ease-out"
			// this.el.style.transition = "4s all"
			
			// Set OtherData
			this.tapTarget = {}
			this._staycnt = 100
			this.perchIndex = 0
			this.count = Math.round(Math.random() * 300, 0)
			this.setTarget(perches[0].getTarget(), this.fly)
		}

		setTarget(target, action) {
			this.target = target
			action.bind(this)()
		}

		animetionCallback() {
			this.count++
			this._splite()
		}

		walk() {
			this._splite(SPLITE_WALK)

			let diff = {}
			diff.left = this.target.left - pxTrim(this.el.style.left)
			let dy = Math.abs(diff.left)
			this._setDirection(diff.left)

			let distance = dy
			
			let time = distance / WALK_SPEED  
			this.el.style.transition = `${time}s left`
			this.el.style["transition-timing-function"] = "linear"
			this.el.style.left = this.target.left + 'px'
			setTimeout(()=>{this._walk()}, time * 1000)
		}

		_walk() {
			this.el.style.backgroundPosition = `0px 0px`
			this._setDirection()

			if ((Math.random() < 0.1)){
				this.setTarget(perches[this.perchIndex].getTarget(), this.walk)
			} else {
				this.stay()
			}

		}

		stay() {
			this._splite(SPLITE_STAY)
			let time = Math.random() * 8
			setTimeout(()=>{this._stay()}, time * 1000)
		}

		_stay() {
			if ((this.tapTarget.top) && (Math.random() < 1.9)) {
				this.setTarget(this.tapTarget, this.fly)
				this.tapTarget = {}
				return
			}

			if ((perches.length < 2) || ((Math.random() < 0.5) && (this.perchIndex != -1))) {
				this.setTarget(perches[this.perchIndex].getTarget(), this.walk)
			} else {
				let tempIndex = 0
				do {
					tempIndex = Math.floor(Math.random() * perches.length)
				} while(tempIndex == this.perchIndex)
				this.perchIndex = tempIndex
				this.setTarget(perches[this.perchIndex].getTarget(), this.fly)	
			}
		}

		fly() {
			let diff = {}
			diff.top = this.target.top - pxTrim(this.el.style.top)
			diff.left = this.target.left - pxTrim(this.el.style.left)
			let dx = Math.abs(diff.top)
			let dy = Math.abs(diff.left)			
			this._setDirection(diff.left)
			let distance = Math.sqrt(dx * dx + dy * dy)

			if (diff.top > 0) {
				this._splite(SPLITE_FLY_DOWN)
			} else {
				this._splite(SPLITE_FLY_UP)
			}

			let time = distance / FLY_SPEED
			this.el.style.transition = `${time}s top, ${time}s left, ${time}s rotate`
			this.el.style.transitionTimingFunction = "ease-out"
			this.el.style.top = this.target.top + 'px'
			this.el.style.left = this.target.left + 'px'
			setTimeout(()=>{this._fly()}, time * 1000)
		}

		_fly() {
			this.el.style.backgroundPosition = `0px 0px`
			this._setDirection()
			this.stay()
		}

		_setDirection(d = 0, deg = 0) {
			let scale = 0
			if (d > 0.3) {
				scale = -1
			} else if (d < -0.3) {
				scale = 1
			}
			if (scale != 0) {
				this.el.style.transform = `scaleX(${scale}) rotate(${deg}deg)`
			} else {
				this.el.style.transform = `rotate(${deg}deg)`
			}
		}

		_splite(mode){
			if (mode != undefined) {
				this._spliteMode = mode
			}

			switch(this._spliteMode) {
				case SPLITE_FLY_UP:
				case SPLITE_FLY_DOWN:
					let count = this.count
					if (this._spliteMode == SPLITE_FLY_DOWN) {
						count = Math.floor(this.count / 4)
					} else {
						count = Math.floor(this.count / 2)
					}

					if (count % 3 == 0) {
						this.el.style.backgroundPosition = `${BIRD_SIZE*1}px 0px`
					} else if (count % 2 == 0) {
						this.el.style.backgroundPosition = `${BIRD_SIZE*2}px 0px`
					} else {
						this.el.style.backgroundPosition = `${BIRD_SIZE*3}px 0px`
					}
					break
				case SPLITE_WALK:
					if (Math.floor(this.count / 10) % 2 == 0) {
						this.el.style.backgroundPosition = `${BIRD_SIZE*5}px 0px`
					} else {
						this.el.style.backgroundPosition = `${BIRD_SIZE*4}px 0px`
					}
					break
				case SPLITE_STAY:
					if (this.count % this._staycnt == 0) {
						let rand = Math.floor(Math.random() * 3, 0) + 6
						this.el.style.backgroundPosition = `${BIRD_SIZE * rand}px 0px`
						this._staycnt = Math.floor(Math.random() * 200, 0) + 10
					}
					break
			}			
		}
	}

	window.addEventListener('load', () => {
		let elPerches = document.getElementsByClassName(`perch`)
		for (let i = 0; i < elPerches.length; i++){
			perches.push(new Perch(elPerches[i]))        
		}

		let elBirds = document.getElementsByClassName(`bird`)
		for (let i = 0; i < elBirds.length; i++){
			birds.push(new Bird(elBirds[i]))        
		}
	})

	let longtapCnt = 0
	window.addEventListener('mousedown', (e) => {
		longtapCnt = 1
		setTimeout(longtap, 200, e)
	})

	window.addEventListener('mouseup', (e) => {
		longtapCnt = 0
	})

	let longtap = (e) => {
		if (longtapCnt==0){
			return
		}
		longtapCnt++
		if (longtapCnt < 10){
			setTimeout(longtap, 200, e)
			return
		}
		longtapCnt = 0

		for (let i = 0, len = birds.length; i < len; i++) {
			birds[i].perchIndex = -1
			birds[i].tapTarget = {top:e.clientY - BIRD_SIZE + BIRD_BOTTOM_OFFSET, left:e.clientX - BIRD_SIZE / 2}
		}
	}

	let animetionFrame = (timestamp) => {
		requestAnimationFrame(animetionFrame)
		for (let i = 0, len = birds.length; i < len; i++) {
			birds[i].animetionCallback()
		}
	}
	requestAnimationFrame(animetionFrame)
})()
