$(document).ready(function() {
  // Acá le decimos a Sammy que comience a correr cuando el sitio cargue
  app.run('#/');
  // Inicializamos esto para que se sumen los elementos que quedaron en el carrito en la última sesión
  app.trigger('update-cart');
  $('[data-toggle="tooltip"]').tooltip();
  // lamando a la función para appendear las categorías en 'Filter by categories'
  categories();
  updateCartSingle();
});

// App sera la variable de Sammy
const app = Sammy('#products');
// Le decimos a Sammy que puede usar el plugin de Templates
app.use(Sammy.Template);
// Y también vamos a usar session y Storage, que permiten almacenar info en local storage
app.use(Sammy.Session);
// Creamos un nuevo objeto vacío que almacenará las compras
let cart = app.session('cart', function() {
  return {};
});

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

app.get('#/cart', function(context) {
  $('#categories').hide();
  context.app.swap('');
  context.render('assets/templates/cart.template')
    .appendTo(context.$element());
});

app.get('#/wishlist', function(context) {
  $('#categories').hide();
  context.app.swap('');
  context.render('assets/templates/wishlist.template')
    .appendTo(context.$element());
});

/* Ahora vamos a definir un nuevo método. En lugar de get, usaremos post
* Cuando usamos GET, le pedimos datos a determinado origen
* Cuando usamos POST, le enviamos datos a determinado destinatario
*/

app.post('#/cart', function(context) {
  let itemId = this.params['item_id'];
  let itemPrice = parseInt(app.item.price.replace('CLP$', '').replace('.', ''));
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

const updateCartSingle = function() {
  $('body').on('click', '.btn-add-to-cart', function() {
    let itemId = $(this).data('value');
    let itemPrice = parseInt($(this).data('price').replace('CLP$', '').replace('.', ''));
    if (!cart[itemId]) {
      cart[itemId] = {quantity: 0,
        price: 0};
    }
    cart[itemId].quantity ++;
    cart[itemId].price += itemPrice;
    app.session('cart', cart);
    app.trigger('update-cart');
  });
};

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


/**
 * función para filtrar un array y devolver los elementos pero sin sus duplicados
 * fuente y explicación profunda:
 * http://www.etnassoft.com/2011/06/24/array-unique-eliminar-valores-duplicados-de-un-array-en-javascript/
 */
Array.prototype.unique=function(a){
  return function() {return this.filter(a)}}(function(a,b,c){return c.indexOf(a,b+1)<0
});


// dándole a Filter by Categories las categorías disponibles en el data.json
function categories(finalArray) {
  // aquí guardaremos todas las categorías
  let catArr = [];
  fetch('assets/data/data.json')
    .then(function (response) {
      return response.json()
    })
    .then(function(data) {
      //pusheando a catArr todas las categorías
      data.forEach(function(element) { /* aquí recorremos cada elemento de la data */
        //console.log(element.categories)
        element.categories.forEach(function(el) { /* element.categories es un array de categorías de un elemento*/
          catArr.push(el); /* aquí pusheamos a catArr cada categría en ese array */
        });
      });
      //console.log(catArr);
      //console.log(catArr.unique())
      //guardando en una variable el nuevo array con los elementos filtrados
      let catArrFilter = catArr.unique();
      // recorremos cada categoría única
      catArrFilter.forEach(function(element, index) {
        let counter = 0; /* inicializamos un contador para saber cuántos elementos de la data poseen
        la categoría que estamos recorriendo */
        for (let i = 0; i < catArr.length; i ++) {
          if (element == catArr[i]) { /* comparamos el elemento actual con todos los elementos de catArr */
            counter = counter + 1; /* cuenta cuántas veces existe */
          }
        }
        let id = index;
        //console.log(counter);
        $('#categories ul').append(`<li><a href="/categories/${id}">${element} <span class="categorie-counter">(${counter})</span></a></li>`);
      })
      // retornar categorías únicas, sin repetirse
      return catArr.unique();
    })
}

app.get('#/categories/:id', context => {
  $('#categories').show();
  context.app.swap('');
  $.each(app.items, (i, item) => {
    context.render('assets/templates/item.template', {id: i,
      item: item})
      .appendTo(context.$element());
      item.id = i;
  });
});


