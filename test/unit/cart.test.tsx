import { describe, it, expect, jest } from '@jest/globals'
import { render, waitFor, within } from '@testing-library/react';

import userEvents from '@testing-library/user-event'

import React from 'react';
import { Provider } from 'react-redux';
import { CartApi, ExampleApi } from '../../src/client/api';
import { Action, addToCart, ApplicationState, checkout, initStore } from '../../src/client/store';
import { CartState, CheckoutFormData, CheckoutResponse, Product, ProductShortInfo } from '../../src/common/types';
import { AxiosResponse } from 'axios';
import { StaticRouter } from 'react-router';
import { Store } from 'redux';
import { generateProduct, generateShortProduct, hasClass } from './utils';
import { Application } from '../../src/client/Application'

type StoreType = Store<ApplicationState, Action> & {
   dispatch: unknown;
}

type GetShortProducts = (() => Promise<AxiosResponse<ProductShortInfo[], any>>);
type CheckoutOrder = () => Promise<AxiosResponse<CheckoutResponse, any>>;

describe('Отображение товаров на странице каталога', () => {
   const baseurl = '/hw/store';
   const location = '/cart';

   const api = new ExampleApi(baseurl);
   const cart = new CartApi();

   let store: StoreType | null = null;
   let app: JSX.Element | null = null;

   const mockShortProducts: ProductShortInfo[] = [
      generateShortProduct(),
      generateShortProduct(),
      generateShortProduct(),
      generateShortProduct(),
      generateShortProduct(),
   ];

   const mockProducts: Product[] =
      mockShortProducts.map((shortProduct) => generateProduct(shortProduct));

   const getProductsMock = jest.fn(() => Promise.resolve({ data: mockShortProducts }));
   const getStateMock = jest.fn(() => ({}));
   const setStorageItemMock = jest.fn();
   const checkoutMock = jest.fn(() => Promise.resolve({ data: { id: 4 } }));

   api.getProducts = getProductsMock as unknown as GetShortProducts;
   api.checkout = checkoutMock as unknown as CheckoutOrder;
   cart.getState = getStateMock;
   cart.setState = setStorageItemMock;

   const validPhoneNumber = '79042541203';

   beforeEach(() => {
      getProductsMock.mockClear();
      getStateMock.mockClear();
      setStorageItemMock.mockClear();
      checkoutMock.mockClear();

      store = initStore(api, cart);
      app = (
         <StaticRouter location={location}>
            <Provider store={store}>
               <Application />
            </Provider>
         </StaticRouter>
      );
   });

   it('состояние корзины должно сохраняться в cart api', async () => {
      render(app as JSX.Element);

      store?.dispatch(addToCart(mockProducts[0]));

      await waitFor(() => {
         expect(setStorageItemMock).toBeCalledTimes(1);
      });
   });

   it('дефолтное состояние корзины должно заполняться из cart api', async () => {
      const addedProduct = generateProduct();

      getStateMock.mockClear()
      getStateMock.mockReturnValueOnce({
         [addedProduct.id]: {
            name: addedProduct.name,
            count: 1,
            price: addedProduct.price
         }
      });

      store = initStore(api, cart);
      app = (
         <StaticRouter location={location}>
            <Provider store={store}>
               <Application />
            </Provider>
         </StaticRouter>
      );

      const { getByTestId } = render(app);

      await waitFor(() => {
         expect(getStateMock).toBeCalledTimes(1);

         const element = getByTestId(addedProduct.id);
         expect(within(element).queryByText(addedProduct.name)).not.toBeNull();
      })
   })

   /*
   it('должно отображаться количесво товаров в корзине в шапке сайта', async () => {
      const { getByTestId } = render(app as JSX.Element);

      mockProducts.forEach((product) => {
         store?.dispatch(addToCart(product));
         store?.dispatch(addToCart(product));
      });

      const correctCount = mockProducts.length;

      await waitFor(() => {
         const headerCartLink = getByTestId("header-cart");

         expect(headerCartLink.innerHTML).toBe(`Cart (${correctCount})`);
      });
   });
   */

   it('не должно отображаться количество товаров в корзине ', async () => {
      const { getByTestId } = render(app as JSX.Element);

      await waitFor(() => {
         const headerCartLink = getByTestId("header-cart");

         expect(headerCartLink.innerHTML).toBe("Cart");
      });
   });

   /*
   it('счетчик корзины должен считать сумму корректно', async () => {
      const correctPrice = mockProducts.reduce((acc, product) => product.price * 2 + acc, 0);

      const { getByTestId } = render(app as JSX.Element);

      mockProducts.forEach((product) => {
         store?.dispatch(addToCart(product));
         store?.dispatch(addToCart(product));
      });

      await waitFor(() => {
         const element = getByTestId('total-price');

         expect(element.innerHTML).toBe(`$${correctPrice}`);
      });
   });
   */

   // it('корзина должна корректно очищаться', async () => {
   //    const { getByText, queryByTestId } = render(app as JSX.Element);

   //    mockProducts.forEach((product) => {
   //       store?.dispatch(addToCart(product));
   //       store?.dispatch(addToCart(product));
   //    });

   //    const element = getByText('Clear shopping cart');

   //    await waitFor(async () => {
   //       await userEvents.click(element);
   //    });

   //    const emptyCartLabel = queryByTestId('empty-cart-catalog-link');

   //    expect(emptyCartLabel).not.toBeNull();
   // });

   it('при подтверждении заказа должно быть вызвано соответствующее api', async () => {
      render(app as JSX.Element);

      const orderDeliveryDetails: CheckoutFormData = {
         address: 'Верхняя Дуброва 10',
         name: 'Konstantin',
         phone: '79042541203'
      };

      const orderSlice = mockProducts.slice(0, 2);

      const cart: CartState = orderSlice.reduce((acc, product) => {
         acc[product.id] = {
            count: 2,
            name: product.name,
            price: product.price,
         };

         return acc;
      }, {} as CartState);

      store?.dispatch(checkout(orderDeliveryDetails, cart));

      await waitFor(() => {
         expect(checkoutMock).toBeCalledTimes(1);
      });
   });

   it('валидация номера телефона должна проходить корректно', async () => {
      const { getByTestId } = render(app as JSX.Element);

      store?.dispatch(addToCart(mockProducts[1]));

      const invalidClassName = 'is-invalid';

      const inputPhone = getByTestId("f-phone");
      const buttonSubmit = getByTestId("submit-button");

      await waitFor(async () => {
         await userEvents.type(inputPhone, validPhoneNumber);
         await userEvents.click(buttonSubmit)
      });

      expect(hasClass(inputPhone, invalidClassName)).toBe(false);
   });

   it('успешный алерт после оформления заказа должен отображаться в соответсвующем цветовом оформлении', async () => {
      const { getByTestId } = render(app as JSX.Element);

      store?.dispatch(addToCart(mockProducts[1]));

      const inputName = getByTestId("f-name");
      const inputPhone = getByTestId("f-phone");
      const inputAddress = getByTestId("f-address");

      const buttonSubmit = getByTestId("submit-button");

      const nameValidValue = 'Konstantin';
      const validAddressValue = 'Vladimir';

      await waitFor(async () => {
         await userEvents.type(inputName, nameValidValue);
         await userEvents.type(inputAddress, validAddressValue);
         await userEvents.type(inputPhone, validPhoneNumber);

         await userEvents.click(buttonSubmit);
      });

      const alert = getByTestId('alert-body');
      const successAlert = 'alert-success';

      expect(hasClass(alert, successAlert)).toBe(true);
   });
})
