import { basename } from "path";
import { CartApi, ExampleApi } from "../../src/client/api";
import { addToCart, initStore } from "../../src/client/store";
import { Product, ProductShortInfo } from "../../src/common/types";

export const generateShortProduct = (): ProductShortInfo => {
   return {
      id: Math.round((Math.random() + 1) * 100000),
      name: `Test short product ${Math.random()}`,
      price: Math.round((Math.random() + 1) * 1000),
   };
};

export const generateProduct = (
   baseData: ProductShortInfo = generateShortProduct()
): Product => {
   return {
      ...baseData,
      description: `Test awesome description ${Math.random()}`,
      color: `Test awesome color ${Math.random()}`,
      material: `Test awesome material ${Math.random()}`
   };
};

export const hasClass = (element: HTMLElement, className: string) => {
   return (' ' + element.className + ' ').indexOf(' ' + className+ ' ') > -1;
}
