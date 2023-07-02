import { describe, it, expect, jest } from '@jest/globals'
import { render, waitFor, within } from '@testing-library/react';

import userEvents from '@testing-library/user-event'

import React from 'react';
import { Provider } from 'react-redux';
import { CartApi, ExampleApi } from '../../src/client/api';
import { Action, addToCart, ApplicationState, initStore } from '../../src/client/store';
import { Product, ProductShortInfo } from '../../src/common/types';
import { AxiosResponse } from 'axios';
import { StaticRouter } from 'react-router';
import { Store } from 'redux';
import { generateProduct, generateShortProduct } from './utils';
import { Application } from '../../src/client/Application'

type StoreType = Store<ApplicationState, Action> & {
   dispatch: unknown;
}

type GetProductsType = (() => Promise<AxiosResponse<ProductShortInfo[], any>>);

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

   api.getProducts = getProductsMock as unknown as GetProductsType;
   cart.getState = getStateMock;


   beforeEach(() => {
      getProductsMock.mockClear();
      getStateMock.mockClear();

      store = initStore(api, cart);
      app = (
         <StaticRouter location={location}>
            <Provider store={store}>
               <Application />
            </Provider>
         </StaticRouter>
      );
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

   it('не должно отображаться количество товаров в корзине ', async () => {
      const { getByTestId } = render(app as JSX.Element);

      await waitFor(() => {
         const headerCartLink = getByTestId("header-cart");

         expect(headerCartLink.innerHTML).toBe("Cart");
      });
   });

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
   })

   it('корзина должна корректно очищаться', async () => {
      const { getByText, queryByTestId, container } = render(app as JSX.Element);

      mockProducts.forEach((product) => {
         store?.dispatch(addToCart(product));
         store?.dispatch(addToCart(product));
      });

      const element = getByText('Clear shopping cart');

      await waitFor(async () => {
         await userEvents.click(element);
      });

      const emptyCartLabel = queryByTestId('empty-cart-catalog-link');

      expect(emptyCartLabel).not.toBeNull();
   })

   it('после успешного оформления заказа должно выводиться окно информирующие об успехе', async () => {})

   it('если не все поля формы заполнены то должны появиться сообщения валидации', async () => {})
})
