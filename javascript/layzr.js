const knot = (extended = {}) => {
  const events = Object.create(null)

  function on (name, handler) {
    events[name] = events[name] || []
    events[name].push(handler)
    return this
  }

  function once (name, handler) {
    handler._once = true
    on(name, handler)
    return this
  }

  function off (name, handler = false) {
    handler
      ? events[name].splice(events[name].indexOf(handler), 1)
      : delete events[name]

    return this
  }

  function emit (name, ...args) {
    // cache the events, to avoid consequences of mutation
    const cache = events[name] && events[name].slice()

    // only fire handlers if they exist
    cache && cache.forEach(handler => {
      // remove handlers added with 'once'
      handler._once && off(name, handler)

      // set 'this' context, pass args to handlers
      handler.apply(this, args)
    })

    return this
  }

  return {
    ...extended,

    on,
    once,
    off,
    emit
  }
}


const Layzr = function(options = {}) {

  // private
  let prevLoc = getLoc()
  let ticking
  let nodes
  let windowHeight

  // options
  const settings = {
    normal: options.normal || 'data-src',
    offset: options.offset || 1500
  }

  // instance
  const instance = knot({
    handlers: handlers,
    check: check,
    update: update
  })

  document.addEventListener("DOMContentLoaded", event => {
   instance
       .update()           // track initial elements
       .check()            // check initial elements
       .handlers(true)     // bind scroll and resize handlers
  })

  return instance

  // location helper
  function getLoc () {
    return window.scrollY || window.pageYOffset
  }

  // debounce helpers
  function requestScroll () {
    prevLoc = getLoc()
    requestFrame()
  }

  function requestFrame () {
    if (!ticking) {
      window.requestAnimationFrame(() => check())
      ticking = true
    }
  }

  // offset helper
  function getOffset (node) {
    return node.getBoundingClientRect().top + prevLoc
  }

  // in viewport helper
  function inViewport (node) {
    const viewTop = prevLoc
    const viewBot = viewTop + windowHeight
    const nodeTop = getOffset(node)
    const nodeBot = nodeTop + node.offsetHeight
    const offset = settings.offset
    return (nodeBot >= viewTop - offset) && (nodeTop <= viewBot + offset)
  }

  // source helper
  function setSource (node) {
    node.style.backgroundImage = `url(${node.getAttribute(settings.normal)})`
    ;[settings.normal].forEach(attr => node.removeAttribute(attr))
    update()
  }

  // API
  function handlers (flag) {
    const action = flag
      ? 'addEventListener'
      : 'removeEventListener'
    ;['scroll', 'resize'].forEach(event => window[action](event, requestScroll))
    return this
  }

  function check () {
    windowHeight = window.innerHeight
    nodes.forEach(node => inViewport(node) && setSource(node))
    ticking = false
    return this
  }

  function update () {
    nodes = Array.prototype.slice.call(document.querySelectorAll(`[${settings.normal}]`))
    return this
  }
}
