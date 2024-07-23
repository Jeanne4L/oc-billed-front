/**
 * @jest-environment jsdom
 */

import 'bootstrap'
import { fireEvent, screen, waitFor } from '@testing-library/dom'

import BillsUI from '../views/BillsUI.js'
import { bills } from '../fixtures/bills.js'
import { ROUTES_PATH } from '../constants/routes.js'
import router from '../app/Router.js'
import { localStorageMock } from '../__mocks__/localStorage.js'
import mockStore from '../__mocks__/store'
import Store from '../app/Store.js'

describe('Given I am connected as an employee', () => {
	let billsSpy = jest.spyOn(Store, 'bills')

	beforeAll(() => {
		Object.defineProperty(window, 'localStorage', { value: localStorageMock })
		window.localStorage.setItem(
			'user',
			JSON.stringify({
				type: 'Employee',
			})
		)
	})

	describe('When I am on Bills Page', () => {
		beforeEach(() => {
			const root = document.createElement('div')
			root.setAttribute('id', 'root')
			document.body.append(root)
			router()
		})

		afterEach(() => {
			document.body.innerHTML = ''
		})

		test('Then bill icon in vertical layout should be highlighted', async () => {
			window.onNavigate(ROUTES_PATH.Bills)

			const windowIcon = await waitFor(() => screen.getByTestId('icon-window'))
			expect(windowIcon.classList).toContain('active-icon')
		})

		test('Then bills should be ordered from earliest to latest', () => {
			document.body.innerHTML = BillsUI({ data: bills })
			const dates = screen
				.getAllByText(
					/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
				)
				.map((a) => a.innerHTML)
			const antiChrono = (a, b) => (a < b ? 1 : -1)
			const datesSorted = [...dates].sort(antiChrono)
			expect(dates).toEqual(datesSorted)
		})

		test('Then bills are retrieved from mock API GET', async () => {
			billsSpy.mockImplementationOnce(mockStore.bills)

			window.onNavigate(ROUTES_PATH.Bills)

			await waitFor(() => screen.getByText('Mes notes de frais'))

			const table = screen.getByRole('table')
			expect(table).toBeTruthy()

			const rows = screen.getAllByRole('row')
			expect(rows.length).toBe(5)
		})

		test('fetches bills from an API and fails with 404 message error', async () => {
			billsSpy.mockImplementationOnce(() => ({
				list() {
					return Promise.reject('Erreur 404')
				},
			}))

			window.onNavigate(ROUTES_PATH.Bills)

			const message = await waitFor(() => screen.getByText(/Erreur 404/))
			expect(message).toBeTruthy()
		})

		test('the click on the eye icon opens a modal', async () => {
			billsSpy.mockImplementationOnce(mockStore.bills)

			window.onNavigate(ROUTES_PATH.Bills)

			await waitFor(() => screen.getByText('Mes notes de frais'))

			const table = screen.getByRole('table')
			expect(table).toBeTruthy()

			const eyesIcon = screen.getAllByTestId('icon-eye')
			fireEvent.click(eyesIcon[0])

			await waitFor(() => {
				expect(screen.getByRole('dialog')).toBeTruthy()
			})
		})
	})
})
