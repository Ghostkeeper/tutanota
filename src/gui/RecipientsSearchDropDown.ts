import m, {Children, ClassComponent, Vnode} from "mithril"
import {scrollListDom} from "./base/GuiUtils.js"
import {px, size} from "./size.js"
import {windowFacade} from "../misc/WindowFacade.js"
import {Recipient} from "../api/common/recipients/Recipient.js"

const EntryHeight = 60

export interface RecipientsSearchDropDownAttrs {
	suggestions: ReadonlyArray<Recipient>
	selectedSuggestionIndex: number
	onSuggestionSelected: (idx: number) => void

	/** max amount of suggestions that can be visible without scrolling */
	maxHeight: number | null
}

export class RecipientsSearchDropDown implements ClassComponent<RecipientsSearchDropDownAttrs> {

	private domSuggestions!: HTMLElement
	private keyboardHeight: number = 0

	oncreate() {
		windowFacade.addKeyboardSizeListener(newSize => {
			// *-------------------*  -
			// |                   |  |
			// |   -------------   |  - <- top
			// |   |           |   |
			// |   |-----------|   |
			// |-------------------|  - <- keyboardHeight
			// | q w e r t z u i o |  |
			// | a s d f g h j k l |  -
			//
			// On iOS screen is not resized when keyboard is opened. Instead we send a signal to WebView with keyboard height.
			this.keyboardHeight = newSize
		})
	}

	view({attrs}: Vnode<RecipientsSearchDropDownAttrs>): Children {
		if (attrs.selectedSuggestionIndex !== attrs.selectedSuggestionIndex && this.domSuggestions) {
			requestAnimationFrame(() => {
				scrollListDom(this.domSuggestions, EntryHeight, attrs.selectedSuggestionIndex)
			})
		}

		// We need to calculate how much space can be actually used for the dropdown. We cannot just add margin like we do with dialog
		// because the suggestions dropdown is absolutely positioned.
		let dropdownHeight = EntryHeight * Math.min(attrs.maxHeight ?? Number.MAX_VALUE, attrs.suggestions.length)
		if (this.domSuggestions) {
			const top = this.domSuggestions.getBoundingClientRect().top
			const availableHeight = window.innerHeight - top - this.keyboardHeight - size.vpad
			dropdownHeight = Math.min(availableHeight, dropdownHeight)
		}

		return m(
			`.suggestions.abs.z4.full-width.elevated-bg.scroll.text-ellipsis${attrs.suggestions.length ? ".dropdown-shadow" : ""}`,
			{
				oncreate: vnode => this.domSuggestions = vnode.dom as HTMLElement,
				style: {
					transition: "height 0.2s",
					height: px(dropdownHeight)
				},
			},
			attrs.suggestions.map(({name, address}, idx) => this.renderSuggestion(attrs, name, address, idx))
		)
	}

	private renderSuggestion(attrs: RecipientsSearchDropDownAttrs, name: string | null, mailAddress: string, idx: number): Children {

		const selected = idx === attrs.selectedSuggestionIndex

		return m(
			".pt-s.pb-s.click.content-hover",
			{
				class: selected ? "content-accent-fg row-selected" : "",
				onmousedown: () => attrs.onSuggestionSelected(idx),
				style: {
					"padding-left": selected ? px(size.hpad_large - 3) : px(size.hpad_large),
					"border-left": selected ? "3px solid" : null,
					height: px(EntryHeight),
				},
			},
			[
				m(".small.full-width.text-ellipsis", name),
				m(".name.full-width.text-ellipsis", mailAddress)
			],
		)
	}
}