/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from '@testing-library/dom'

import router from '../app/Router.js'
import NewBill from '../containers/NewBill.js'
import NewBillUI from '../views/NewBillUI.js'
import mockStore from '../__mocks__/store.js'
import { localStorageMock } from '../__mocks__/localStorage.js'
import { ROUTES_PATH } from '../constants/routes.js'

describe('Given I am connected as an employee', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })
    window.localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
        email: 'employee@test.tld'
      })
    )
  })

  describe('When I am on NewBill Page', () => {
    beforeEach(() => {
      const root = document.createElement('div')
      root.setAttribute('id', 'root')
      document.body.append(root)
      router()

      document.body.innerHTML = NewBillUI()
    })

    afterEach(() => {
      document.body.innerHTML = ''
    })

    describe('When I import a file', () => {
      test('It should be an image', () => {
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

    describe('When I submit the form', () => {
      test('I returned on the page of bills', async () => {
        const onNavigate = jest.fn()
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage
        })

        const createSpy = jest.spyOn(mockStore, 'bills')

        newBill.updateBill = jest.fn()

        const file = new File(['dummy content'], 'dummy.png', {
          type: 'image/png'
        })
        const fileInput = screen.getByTestId('file')

        fireEvent.change(fileInput, {
          target: {
            files: [file]
          }
        })

        await waitFor(() => expect(createSpy).toHaveBeenCalledTimes(1))

        newBill.fileName = file.name

        fireEvent.change(screen.getByTestId('expense-type'), {
          target: { value: 'Transports' }
        })
        fireEvent.change(screen.getByTestId('expense-name'), {
          target: { value: 'Taxi' }
        })
        fireEvent.change(screen.getByTestId('amount'), {
          target: { value: 100 }
        })
        fireEvent.change(screen.getByTestId('datepicker'), {
          target: { value: '2023-09-19' }
        })
        fireEvent.change(screen.getByTestId('vat'), {
          target: { value: '20' }
        })
        fireEvent.change(screen.getByTestId('pct'), {
          target: { value: 10 }
        })
        fireEvent.change(screen.getByTestId('commentary'), {
          target: { value: 'Business trip' }
        })
        
        const form = screen.getByTestId('form-new-bill')
        fireEvent.submit(form)

        const user = JSON.parse(localStorage.getItem('user'))
        const { email} = user

        const expectedBill = {
          email,
          type: 'Transports',
          name: 'Taxi',
          amount: 100,
          date: '2023-09-19',
          vat: '20',
          pct: 10,
          commentary: 'Business trip',
          fileUrl: 'https://localhost:3456/images/test.jpg',
          fileName: 'dummy.png',
          status: 'pending'
        }

        expect(newBill.updateBill).toHaveBeenCalledWith(expectedBill)
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills'])
      })
    })
  })
})
