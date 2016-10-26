/* Create element */
export const cE = (element, props, child) => {
	element = document.createElement(element);
	if(props) {
		typeof props === 'string' && (props = {text: props});
		for(let id in props) {
			if(id.substr(0, 2) === 'on') {
				aE(element, id.substr(2), props[id]);
			} else {
				const prop = id === 'text' ? 'innerText' : id;
				element[prop] = props[id];
			}
		}
	}
	child && aC(element, child);
	return element;
};
/* Append child/class */
export const aC = (element, child) => {
	if(typeof child === 'string') element.classList.add(child);
	else element.appendChild(child);
};
/* Remove child/class */
export const rC = (element, child) => {
	if(typeof child === 'string') element.classList.remove(child);
	else element.removeChild(child);
};
/* Add event */
export const aE = (element, event, handler) => element.addEventListener(event, handler);
/* Remove event */
export const rE = (element, event, handler) => element.removeEventListener(event, handler);
/* Empty element */
export const eE = (element) => {
	while(element.firstChild) rC(element, element.firstChild);
};
/* Text node */
export const tN = (text) => {
	return document.createTextNode(text);
};
