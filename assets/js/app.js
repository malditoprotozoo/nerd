$(document).ready(function() {
  // Acá le decimos a Sammy que comience a correr cuando el sitio cargue
  app.run('#/');
});

// App sera la variable de Sammy
const app = Sammy('#products');
// Le decimos a Sammy que puede usar el plugin de Templates
app.use(Sammy.Template);

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
  context.app.swap('');
  $.each(app.items, (i, item) => {
    context.render('assets/templates/item.template', {id: i,
      item: item})
      .appendTo(context.$element());
  });
});

// Nueva ruta, la que se creará al hacer click en cada imagen
app.get('#/item/:id', function(context) {
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


$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})