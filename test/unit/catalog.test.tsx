import { describe, it, expect, jest, afterEach } from '@jest/globals'
import { render, waitFor, within } from '@testing-library/react';

import React from 'react';
import { Provider } from 'react-redux';
import { CartApi, ExampleApi } from '../../src/client/api';
import { Action, addToCart, ApplicationState, initStore } from '../../src/client/store';
import { Product, ProductShortInfo } from '../../src/common/types';
import { AxiosResponse } from 'axios';
import { Catalog } from '../../src/client/pages/Catalog';
import { StaticRouter } from 'react-router';
import { Store } from 'redux';
import { generateProduct, generateShortProduct } from './utils';

type StoreType = Store<ApplicationState, Action> & {
   dispatch: unknown;
}

describe('Отображение товаров на странице каталога', () => {
   const basename = '/hw/store';
   const api = new ExampleApi(basename);
   const cart = new CartApi();

   let store: StoreType | null = null;
   let app: JSX.Element | null = null;

   const mockGoods: ProductShortInfo[] = [
      generateShortProduct(),
      generateShortProduct(),
      generateShortProduct(),
      generateShortProduct(),
      generateShortProduct(),
   ];

   const getProductsMock = jest.fn(() => Promise.resolve({ data: mockGoods }));

   api.getProducts =
      getProductsMock as unknown as (() => Promise<AxiosResponse<ProductShortInfo[], any>>);


   beforeEach(() => {
      getProductsMock.mockClear()
      store = initStore(api, cart);
      app = (
         <StaticRouter>
            <Provider store={store}>
               <Catalog />
            </Provider>
         </StaticRouter>
      );
   });

   it('должно отрендерить элементы на странице', async () => {
      const { getByTestId } = render(app as JSX.Element);

      await waitFor(() => {
         for (let item of mockGoods) {
            const element = getByTestId(item.id);

            const productName = within(element).queryByText(item.name);
            expect(productName).not.toBeNull();

            const productDescription = within(element).queryByText(`$${item.price}`);
            expect(productDescription).not.toBeNull();
         }
      });
   });

   it('должно вызвать api один раз', async () => {
      render(app as JSX.Element);

      await waitFor(() => {
         expect(getProductsMock).toHaveBeenCalledTimes(1);
      });
   });

   it('если товар добавлен в корзину должен отображаться соответсвующий статус', async () => {
      const { getByTestId } = render(app as JSX.Element);

      const addedProduct: Product = generateProduct(mockGoods[0]);

      const addedLabel = 'Item in cart';

      store?.dispatch(addToCart(addedProduct));

      await waitFor(() => {
         const element = getByTestId(addedProduct.id)
         const addedLabelEl = within(element).queryByText(addedLabel)
         expect(addedLabel).not.toBeNull()
      });
   });
})
