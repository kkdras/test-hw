const { assert } = require('chai');
const { resolutions } = require('./const');
const { hasClass } = require('./utils');

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
      await this.browser.url('http://localhost:3000/hw/store/catalog/1');

      this.browser.setWindowSize(
         resolutions.mobile.width,
         resolutions.mobile.height
      );

      await this.browser.assertView(
         'compare buttons',
         '.ProductDetails-AddToCart'
      );
   });
});
