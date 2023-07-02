const { assert } = require('chai');
const { resolutions } = require('./const');

describe('тест верстки', async function() {
   it('шапка сайта должна отрендериться корректно', async function () {
      await this.browser.url('http://localhost:3000/hw/store/');

      this.browser.setWindowSize(
         resolutions.desktop.width,
         resolutions.mobile.height
      );

      await this.browser.assertView('navbar desktop', '.navbar');

      this.browser.setWindowSize(
         resolutions.mobile.width,
         resolutions.mobile.height
      );

      await this.browser.assertView('navbar mobile', '.navbar');
   });

   it('test opened mobile navbar', async function () {
      await this.browser.url('http://localhost:3000/hw/store/');

      this.browser.setWindowSize(
         resolutions.mobile.width,
         resolutions.mobile.height
      );

      const toggler = await this.browser.$('.navbar-toggler-icon');

      await toggler.click();

      await this.browser.assertView('navbar mobile opened', '.navbar');
   });
});
