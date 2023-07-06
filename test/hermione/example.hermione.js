const { assert } = require('chai');
const { resolutions } = require('./const');
const { hasClass } = require('./utils');
const axios = require('axios')

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

      this.browser.setWindowSize(
         resolutions.mobile.width,
         resolutions.mobile.height
      );

      await this.browser.assertView(
         'compare buttons',
         '.ProductDetails-AddToCart'
      );
   });

   it('GET-запрос возвращает запись с тем же id', async function () {
      const shortProducts = await axios.get(`http://localhost:3000/hw/store/api/products`);

      const someShortProduct = shortProducts.data[shortProducts.data.length - 1];

      const id = someShortProduct.id;

      const fullProduct = await axios.get(`http://localhost:3000/hw/store/api/products/${id}`);

      assert.equal(someShortProduct.id, fullProduct.data.id);
   });

   it('при GET-запросе продуктов у каждого продукта должны быть обязательные поля', async () => {
      const shortProducts = await axios.get(`http://localhost:3000/hw/store/api/products`);

      for (let shortProduct of shortProducts.data) {
         assert.typeOf(shortProduct.name, 'string', 'Имя должно быть строкой');
         assert.typeOf(shortProduct.id, 'number', 'Id должен быть числом');
         assert.typeOf(shortProduct.price, 'number', 'Стоимость должна быть числом');
      }
   });
});
