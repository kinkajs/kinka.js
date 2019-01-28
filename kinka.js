(()=>{
	'use strict'

	// Changeable constant (変更可能な定数パラメータ)
	const ASSET_FILES = ["sprite1.png", "sprite2.png", "sprite3.png"]
	const KINKA_SIZE = 50
	const KINKA_BOTTOM_OFFSET = 10
	const KINKA_BOTTOM_OFFSET_TAP = KINKA_SIZE + 30
	const FLY_SPEED = 200
	const WALK_SPEED = 80
	const FLY_ASCEND_SKIPFRAME = 2
	const FLY_DESCEND_SKIPFRAME = 4

	// Unchangeable constant (変更不可の定数パラメータ)
	const SPLITE_STAY = 1
	const SPLITE_WALK = 2
	const SPLITE_FLY_UP = 3
	const SPLITE_FLY_DOWN = 4
	const KINKA_CLASS_NAME = "kinka"
	const PERCH_CLASS_NAME = "perch"
	const SPLITE_CLASS_NAME = "kinkasp"

	let CURRENT_PATH = ""
	let kinkas = []
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
			return({top : this.el.offsetTop - KINKA_SIZE + KINKA_BOTTOM_OFFSET ,
					left: this.el.offsetLeft + (this.el.offsetWidth * Math.random() - KINKA_SIZE / 2)})
		}
	}

	// キンカチョウのクラス
	class Kinka {
		constructor(element) {
			this._initStyles(element)
			
			// Set OtherData
			this.tapTarget = {}
			this._staycnt = 100
			this.perchIndex = this._getPerchIndex()
			this.count = Math.round(Math.random() * 300, 0)
			this.setTarget(perches[this.perchIndex].getTarget(), this.fly)
		}

		_initStyles(element) {
			this.el = element
			this.el.style.position = "absolute"
			this.el.style.top = Math.random() * window.innerHeight + 'px'
			this.el.style.left = Math.random() * window.innerWidth + 'px'
			this.el.style.width = KINKA_SIZE + 'px'
			this.el.style.height = KINKA_SIZE + 'px'
			this.el.style.zIndex = "10000"
			this.el.style.backgroundImage = `url(${CURRENT_PATH}/${ASSET_FILES[this._getSpliteNumber()]})`
			this.el.style.backgroundSize = `auto ${KINKA_SIZE}px`
			this.el.style.backgroundPosition = `0px 0px`
			this.el.style.backfaceVisibility = "hidden"
			this.el.style.transitionTimingFunction = "ease-out"
		}

		_getSpliteNumber() {
			let splite = 0
			let classes = this.el.className.split(" ")
			for (let i = 0, l = classes.length; i < l; i++) {
				if (classes[i].indexOf(SPLITE_CLASS_NAME) === 0) {
					let postfix = parseInt(classes[i].substring(SPLITE_CLASS_NAME.length))
					if ((!isNaN(postfix)) && (postfix > 0)) {
						postfix--
						splite = Math.min(postfix, ASSET_FILES.length - 1)
						break
					}
				}
			}
			return splite
		}

		_getPerchIndex() {
			let perchIndex = 0
			let classes = this.el.className.split(" ")
			for (let i = 0, l = classes.length; i < l; i++) {
				if (classes[i].indexOf(PERCH_CLASS_NAME) === 0) {
					let postfix = parseInt(classes[i].substring(PERCH_CLASS_NAME.length))
					if ((!isNaN(postfix)) && (postfix > 0)) {
						postfix--
						perchIndex = Math.min(postfix, perches.length - 1)
						break
					}
				}
			}
			return perchIndex
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
			let transition = this._setTransition(this.target, WALK_SPEED)
			this._splite(SPLITE_WALK)
			setTimeout(()=>{this._walk()}, transition.time * 1000)
		}

		_walk() {
			this.el.style.backgroundPosition = `0px 0px`
			this._setDirection()

			if ((Math.random() < 0.1) && (this.perchIndex != -1)) {
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
			let transition = this._setTransition(this.target, FLY_SPEED, {transition_mode:"ease-out"})
			this._splite(transition.diff.top >= 0 ? SPLITE_FLY_DOWN : SPLITE_FLY_UP)
			setTimeout(()=>{this._fly()}, transition.time * 1000)
		}

		_fly() {
			this.el.style.backgroundPosition = `0px 0px`
			this._setDirection()
			this.stay()
		}

		_setTransition(target, speed, option = {transition_mode: "linear"}) {
			let diff = {}
			diff.top = target.top - pxTrim(this.el.style.top)
			diff.left = target.left - pxTrim(this.el.style.left)
			let dx = Math.abs(diff.top)
			let dy = Math.abs(diff.left)			
			this._setDirection(diff.left)
			let distance = Math.sqrt(dx * dx + dy * dy)
			let time = distance / speed
			this.el.style.transition = `${time}s top, ${time}s left`
			this.el.style.transitionTimingFunction = option.transition_mode
			this.el.style.top = this.target.top + 'px'
			this.el.style.left = this.target.left + 'px'
			return {diff, time}
		}

		_setDirection(d = 0) {
			let scale = 0
			if (Math.abs(d) > 0.3) {
				scale = d > 0? -1 : 1
				this.el.style.transform = `scaleX(${scale})`
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
						count = Math.floor(this.count / FLY_DESCEND_SKIPFRAME)
					} else {
						count = Math.floor(this.count / FLY_ASCEND_SKIPFRAME)
					}

					if (count % 3 == 0) {
						this.el.style.backgroundPosition = `${KINKA_SIZE*1}px 0px`
					} else if (count % 2 == 0) {
						this.el.style.backgroundPosition = `${KINKA_SIZE*2}px 0px`
					} else {
						this.el.style.backgroundPosition = `${KINKA_SIZE*3}px 0px`
					}
					break
				case SPLITE_WALK:
					if (Math.floor(this.count / 10) % 2 == 0) {
						this.el.style.backgroundPosition = `${KINKA_SIZE*5}px 0px`
					} else {
						this.el.style.backgroundPosition = `${KINKA_SIZE*4}px 0px`
					}
					break
				case SPLITE_STAY:
					if (this.count % this._staycnt == 0) {
						let rand = Math.floor(Math.random() * 3, 0) + 6
						this.el.style.backgroundPosition = `${KINKA_SIZE * rand}px 0px`
						this._staycnt = Math.floor(Math.random() * 200, 0) + 10
					}
					break
			}			
		}
	}

	window.addEventListener('load', () => {
		let elPerches = document.getElementsByClassName(PERCH_CLASS_NAME)
		for (let i = 0; i < elPerches.length; i++){
			perches.push(new Perch(elPerches[i]))
		}

		let elKinkas = document.getElementsByClassName(KINKA_CLASS_NAME)
		for (let i = 0; i < elKinkas.length; i++){
			kinkas.push(new Kinka(elKinkas[i]))        
		}
	})

	let longtapCnt = 0
	let _pressdown = (e) => {
		longtapCnt = 1
		setTimeout(longtap, 200, e)
	}
	let _pressup = () => {
		longtapCnt = 0
	}

	let longtap = (e) => {
		if (!longtapCnt) return 

		longtapCnt++
		if (longtapCnt < 10){
			setTimeout(longtap, 200, e)
			return
		}
		longtapCnt = 0

		for (let i = 0, len = kinkas.length; i < len; i++) {
			kinkas[i].perchIndex = -1 
			let top, left
			if (e instanceof TouchEvent) {
				left = e.touches[0].clientX - KINKA_SIZE / 2
				top = e.touches[0].clientY - KINKA_BOTTOM_OFFSET_TAP
			} else {
				left = e.clientX - KINKA_SIZE / 2
				top = e.clientY - KINKA_SIZE + KINKA_BOTTOM_OFFSET
			}
			left += window.pageXOffset
			top += window.pageYOffset
			kinkas[i].tapTarget = {top, left}
		}
	}

	window.addEventListener('mousedown', (e) => {_pressdown(e)})
	window.addEventListener('touchstart', (e) => {_pressdown(e)})
	window.addEventListener('mouseup', () => {_pressup()})
	window.addEventListener('touchend', () => {_pressup()})

	let animetionFrame = () => {
		requestAnimationFrame(animetionFrame)
		for (let i = 0, len = kinkas.length; i < len; i++) {
			kinkas[i].animetionCallback()
		}
	}
	requestAnimationFrame(animetionFrame)
})()
