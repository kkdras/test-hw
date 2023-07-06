const { assert } = require('chai');
const { resolutions } = require('./const');
const { hasClass } = require('./utils');
const axios = require('axios');

const getShortProducts = () => axios.get(`http://localhost:3000/hw/store/api/products`);
const getProductByID = (id) => axios.get(`http://localhost:3000/hw/store/api/products/${id}`);
const checkout = (form, cart) => axios.post(`http://localhost:3000/hw/store/api/checkout`, { form, cart });

describe('интеграционные тесты.', async function() {
   it('после перехода по разделю мобильного меню оно должно закрыться', async function () {
      await this.browser.url('http://localhost:3000/hw/store/');

      this.browser.setWindowSize(
         resolutions.mobile.width,
         resolutions.mobile.height
      );

      const toggler = await this.browser.$('.navbar-toggler-icon');

      await toggler.click();

      const activeLink = await this.browser.$('.nav-link');

      await activeLink.click();

      await this.browser.pause(1000);

      const node = await this.browser.$('.Application-Menu');
      const nodeClasses = await node.getAttribute('class');

      assert.equal(hasClass(nodeClasses, 'collapse'), true);
   });

   it('кнопка должна быть правильного размера', async function () {
      await this.browser.url('http://localhost:3000/hw/store/catalog/0');

      await this.browser.assertView(
         'compare buttons',
         '.ProductDetails-AddToCart'
      );
   });

   it('GET-запрос возвращает запись с тем же id', async function () {
      const shortProducts = await getShortProducts();

      const someShortProduct = shortProducts.data[shortProducts.data.length - 1];

      const fullProduct = await getProductByID(someShortProduct.id);

      assert.equal(someShortProduct.id, fullProduct.data.id);
   });

   it('при GET-запросе продуктов у каждого продукта должны быть обязательные поля', async () => {
      const shortProducts = await getShortProducts();

      for (let shortProduct of shortProducts.data) {
         assert.typeOf(shortProduct.name, 'string', 'Имя должно быть строкой');
         assert.typeOf(shortProduct.id, 'number', 'Id должен быть числом');
         assert.typeOf(shortProduct.price, 'number', 'Стоимость должна быть числом');
      }
   });

   it('id заказа должен увеличиваться в инкрементальном порядке', async function () {
      const orderData1 = await checkout({}, {});

      await this.browser.pause(50);

      const orderData2 = await checkout({}, {});

      const diff = Math.abs(orderData1.data.id - orderData2.data.id);
      const expectedDiff = 1;

      assert.equal(diff, expectedDiff, 'Id\'s должны отличаться на единицу');
   });
});
