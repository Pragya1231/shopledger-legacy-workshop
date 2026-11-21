var test = require('node:test');
var assert = require('node:assert/strict');
var pricing = require('../lib/pricing');
var invoice = require('../lib/invoice');

test('invoice GST and total match order pricing using the HSN slab', function () {
  var items = [
    { id: 1, name: 'Rice', hsn: '1006', price: 100, qty: 2 }
  ];

  var billed = pricing.computeTotals(items, '');
  var printed = invoice.computeInvoiceFigures({ items: items, coupon: '' });

  assert.equal(billed.subtotal, 200);
  assert.equal(billed.tax, 10);
  assert.equal(billed.total, 210);
  assert.equal(printed.subtotal, 200);
  assert.equal(printed.rows[0].gstPercent, 5);
  assert.equal(printed.rows[0].lineTax, billed.lines[0].tax);
  assert.equal(printed.tax, billed.tax);
  assert.equal(printed.cgst, billed.cgst);
  assert.equal(printed.sgst, billed.sgst);
  assert.equal(printed.total, billed.total);
});

test('invoice applies coupon and GST the same way as order pricing', function () {
  var items = [
    { id: 1, name: 'Rice', hsn: '1006', price: 100, qty: 2 }
  ];

  var billed = pricing.computeTotals(items, 'WELCOME');
  var printed = invoice.computeInvoiceFigures({ items: items, coupon: 'WELCOME' });

  assert.equal(billed.discount, 10);
  assert.equal(billed.tax, 9.5);
  assert.equal(billed.total, 199.5);
  assert.equal(printed.discount, billed.discount);
  assert.equal(printed.rows[0].lineTax, billed.lines[0].tax);
  assert.equal(printed.tax, billed.tax);
  assert.equal(printed.total, billed.total);
});

test('invoice does not report a mismatch when its total matches the recorded billed total', function () {
  var order = {
    id: 42,
    date: '21/11/2026',
    customer: 'Test Customer',
    paymentMode: 'cash',
    coupon: '',
    subtotal: 200,
    discount: 0,
    tax: 10,
    total: 210,
    items: [{ id: 1, name: 'Rice', hsn: '1006', price: 100, qty: 2 }]
  };

  var html = invoice.render(order);

  assert.match(html, /Invoice Total<\/td><td class="r">₹210\.00/);
  assert.doesNotMatch(html, /Accountant Reconciliation Notice/);
});
