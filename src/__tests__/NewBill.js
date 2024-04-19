/**
 * @jest-environment jsdom
 */

import { fireEvent, screen } from '@testing-library/dom'
import NewBillUI from '../views/NewBillUI.js'
import NewBill from '../containers/NewBill.js'

describe('Given I am connected as an employee', () => {
	describe('When I am on NewBill Page', () => {
		// test('Then ...', () => {
		// 	const html = NewBillUI()
		// 	document.body.innerHTML = html
		// 	//to-do write assertion
		// })
		describe('When I import a file', () => {
			test('It should be an image', () => {
				const html = NewBillUI()
				document.body.innerHTML = html
				const file = new File(['dummy content'], 'dummy.png', {
					type: 'image/png',
				})
				const fileInput = screen.getByTestId('file')

				fireEvent.change(fileInput, {
					target: {
						files: [file],
					},
				})

				expect(fileInput.files[0].type).toBe('image/png')
			})
		})
	})
})
