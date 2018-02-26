$(document).ready(function() {
  // Acá le decimos a Sammy que comience a correr cuando el sitio cargue
  app.run('#/');
  // Inicializamos esto para que se sumen los elementos que quedaron en el carrito en la última sesión
  app.trigger('update-cart');
  $('[data-toggle="tooltip"]').tooltip();
});

// App sera la variable de Sammy
const app = Sammy('#products');
// Le decimos a Sammy que puede usar el plugin de Templates
app.use(Sammy.Template);
// Y también vamos a usar session y Storage, que permiten almacenar info en local storage
app.use(Sammy.Session);

app.around(callback => {
  fetch('assets/data/data.json')
    .then(response => response.json())
    .then(response => {
      app.items = response;
    })
    .then(callback)
    .catch(error => console.log(error));
});

// Con app.get creamos una nueva ruta. Context es el espacio en dónde nos ubicamos
// CALLBACK
app.get('#/', context => {
  $('#categories').show();
  context.app.swap('');
  $.each(app.items, (i, item) => {
    context.render('assets/templates/item.template', {id: i,
      item: item})
      .appendTo(context.$element());
      item.id = i;
  });
});

// Nueva ruta, la que se creará al hacer click en cada imagen
app.get('#/item/:id', function(context) {
  $('#categories').hide();
  /*
  * En este caso no usamos funciones flecha porque usaremos this
  * Dentro de este context, this será el producto en el que el usuario hizo click
  */
  app.item = app.items[this.params['id']];
  if (!app.item) {
    return app.notFound();
  }
  this.partial('assets/templates/item_detail.template');
});

/* Ahora vamos a definir un nuevo método. En lugar de get, usaremos post
* Cuando usamos GET, le pedimos datos a determinado origen
* Cuando usamos POST, le enviamos datos a determinado destinatario
*/

app.post('#/cart', function(context) {
  let itemId = this.params['item_id'];
  let itemPrice = parseInt(app.item.price.replace('CLP$', '').replace('.', ''));
  let q = 0;
  let cart = this.session('cart', function() {
    return {};
  });
  if (!cart[itemId]) {
    cart[itemId] = {quantity: 0,
      price: 0};
  }
  cart[itemId].quantity += parseInt(this.params['quantity']);
  cart[itemId].price += parseInt(itemPrice);
  app.session('cart', cart);
  console.log(cart);
  this.trigger('update-cart');
});

app.bind('update-cart', function() {
  let sum = 0;
  let total = 0;
  $.each(app.session('cart') || {}, function(id, product) {
    sum += product.quantity;
    total += product.price;
  });
  $('#cart-access')
    .find('#items-cart').text(sum).end()
    .find('#total-amount').text(total).end()
    .animate({paddingTop: '30px'})
    .animate({paddingTop: '10px'});
});