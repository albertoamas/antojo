-- =====================================================================
-- Antojo MVP · 03 Fotos temporales
-- Asigna fotos de ejemplo a los platos de prueba, mientras no haya fotos reales.
-- Fuente: TheMealDB (themealdb.com), imágenes libres para proyectos de desarrollo.
-- Son referenciales: no son los platos reales de los locales.
-- Ejecutar en Supabase: SQL Editor → New query → Run. Se puede ejecutar más de una vez.
-- Solo cambia platos que todavía no tienen foto (no pisa fotos subidas desde el panel).
-- =====================================================================

update public.platos p
set foto_url = v.url
from (values
  ('Burger Lab', 'Smash doble con cheddar', 'https://www.themealdb.com/images/media/meals/44bzep1761848278.jpg'),
  ('Burger Lab', 'Clásica Lab', 'https://www.themealdb.com/images/media/meals/vdwloy1713225718.jpg'),
  ('Burger Lab', 'Burger BBQ con tocino', 'https://www.themealdb.com/images/media/meals/atd5sh1583188467.jpg'),
  ('La Esquina Smash', 'Clásica a la parrilla', 'https://www.themealdb.com/images/media/meals/lgmnff1763789847.jpg'),
  ('La Esquina Smash', 'Smash triple', 'https://www.themealdb.com/images/media/meals/k420tj1585565244.jpg'),
  ('La Esquina Smash', 'Burger de pollo crispy', 'https://www.themealdb.com/images/media/meals/sbx7n71587673021.jpg'),
  ('Brasa & Pan', 'Burger a la brasa', 'https://www.themealdb.com/images/media/meals/44bzep1761848278.jpg'),
  ('Brasa & Pan', 'Burger de lentejas', 'https://www.themealdb.com/images/media/meals/ae6clc1760524712.jpg'),
  ('El Tejar Burger', 'Burger universitaria', 'https://www.themealdb.com/images/media/meals/vdwloy1713225718.jpg'),
  ('El Tejar Burger', 'Doble universitaria', 'https://www.themealdb.com/images/media/meals/lgmnff1763789847.jpg'),
  ('Chapaca Burger', 'Chapaca con ají', 'https://www.themealdb.com/images/media/meals/k420tj1585565244.jpg'),
  ('Chapaca Burger', 'Burger con huevo y plátano', 'https://www.themealdb.com/images/media/meals/j80gmw1764372176.jpg'),
  ('Doble Queso', 'Doble queso clásica', 'https://www.themealdb.com/images/media/meals/44bzep1761848278.jpg'),
  ('Doble Queso', 'Burger de champiñones', 'https://www.themealdb.com/images/media/meals/atd5sh1583188467.jpg'),
  ('Mordisco Burgers', 'Mordisco smash', 'https://www.themealdb.com/images/media/meals/vdwloy1713225718.jpg'),
  ('Mordisco Burgers', 'Mordisco picante', 'https://www.themealdb.com/images/media/meals/lgmnff1763789847.jpg'),
  ('Horno de Barro', 'Pizza margarita personal', 'https://www.themealdb.com/images/media/meals/x0lk931587671540.jpg'),
  ('Horno de Barro', 'Pizza de chorizo chapaco', 'https://www.themealdb.com/images/media/meals/wf49qs1763075222.jpg'),
  ('Pizzería Don Gusto', 'Pizza hawaiana', 'https://www.themealdb.com/images/media/meals/lrfdwz1764438393.jpg'),
  ('Pizzería Don Gusto', 'Pizza pepperoni', 'https://www.themealdb.com/images/media/meals/x0lk931587671540.jpg'),
  ('Pollos El Chapaco', 'Cuarto de pollo broaster', 'https://www.themealdb.com/images/media/meals/40r49m1763197022.jpg'),
  ('Pollos El Chapaco', 'Alitas BBQ (8 u.)', 'https://www.themealdb.com/images/media/meals/4hzyvq1763792564.jpg'),
  ('Broaster Fátima', 'Pollo broaster con papas', 'https://www.themealdb.com/images/media/meals/tyywsw1505930373.jpg'),
  ('Broaster Fátima', 'Alitas picantes', 'https://www.themealdb.com/images/media/meals/feh9k21784665694.jpg'),
  ('Doña Rosa Comida Chapaca', 'Saice tarijeño', 'https://www.themealdb.com/images/media/meals/k07k271782502861.jpg'),
  ('Doña Rosa Comida Chapaca', 'Picante de pollo', 'https://www.themealdb.com/images/media/meals/9ya6o71780262651.jpg'),
  ('Doña Rosa Comida Chapaca', 'Sopa de maní', 'https://www.themealdb.com/images/media/meals/sqpqtp1515365614.jpg'),
  ('El Patio del Saice', 'Saice especial', 'https://www.themealdb.com/images/media/meals/uyqrrv1511553350.jpg'),
  ('El Patio del Saice', 'Ranga ranga', 'https://www.themealdb.com/images/media/meals/sxxpst1468569714.jpg'),
  ('El Patio del Saice', 'Chancao de pollo', 'https://www.themealdb.com/images/media/meals/sypxpx1515365095.jpg'),
  ('La Ranga de San Jorge', 'Ranga', 'https://www.themealdb.com/images/media/meals/md8w601593348504.jpg'),
  ('La Ranga de San Jorge', 'Saice', 'https://www.themealdb.com/images/media/meals/cgl60b1683206581.jpg'),
  ('La Ranga de San Jorge', 'Cangrejitos (2 u.)', 'https://www.themealdb.com/images/media/meals/nxnny61763250596.jpg'),
  ('Salteñería La Pampa', 'Salteña de carne', 'https://www.themealdb.com/images/media/meals/dxpc7j1764370714.jpg'),
  ('Salteñería La Pampa', 'Salteña de pollo', 'https://www.themealdb.com/images/media/meals/q4xgij1782851193.jpg'),
  ('Salteñería La Pampa', 'Tucumana', 'https://www.themealdb.com/images/media/meals/q99te31763075494.jpg'),
  ('Empanadas del Molino', 'Empanada blanqueada', 'https://www.themealdb.com/images/media/meals/u9ezi21764375474.jpg'),
  ('Empanadas del Molino', 'Empanada de queso', 'https://www.themealdb.com/images/media/meals/9tllzd1782853513.jpg'),
  ('Empanadas del Molino', 'Salteña picante', 'https://www.themealdb.com/images/media/meals/dxpc7j1764370714.jpg'),
  ('Lomitos 24', 'Lomito completo', 'https://www.themealdb.com/images/media/meals/lmwaf61783805434.jpg'),
  ('Lomitos 24', 'Sándwich de chola', 'https://www.themealdb.com/images/media/meals/djdg8l1784578885.jpg'),
  ('Sandwichería El Tejar', 'Sándwich de pollo', 'https://www.themealdb.com/images/media/meals/o93jur1782769321.jpg'),
  ('Sandwichería El Tejar', 'Lomito económico', 'https://www.themealdb.com/images/media/meals/wooxjq1784663522.jpg'),
  ('Sandwichería El Tejar', 'Burger sencilla', 'https://www.themealdb.com/images/media/meals/atd5sh1583188467.jpg'),
  ('Café Viñedo', 'Torta de chocolate', 'https://www.themealdb.com/images/media/meals/qxutws1486978099.jpg'),
  ('Café Viñedo', 'Café con alfajor', 'https://www.themealdb.com/images/media/meals/a4kgf21763075288.jpg'),
  ('Café Viñedo', 'Copa de helado', 'https://www.themealdb.com/images/media/meals/9kecho1784575366.jpg'),
  ('Dulce Tarija', 'Cangrejitos (6 u.)', 'https://www.themealdb.com/images/media/meals/erzs951763296201.jpg'),
  ('Dulce Tarija', 'Torta tres leches', 'https://www.themealdb.com/images/media/meals/f9qog11784574376.jpg'),
  ('Dulce Tarija', 'Alfajor de maicena', 'https://www.themealdb.com/images/media/meals/3wnyvh1764373818.jpg'),
  ('Verde Bowl', 'Bowl de quinua', 'https://www.themealdb.com/images/media/meals/k29viq1585565980.jpg'),
  ('Verde Bowl', 'Ensalada César con pollo', 'https://www.themealdb.com/images/media/meals/t5rgav1784659936.jpg'),
  ('Verde Bowl', 'Burger de lentejas', 'https://www.themealdb.com/images/media/meals/ae6clc1760524712.jpg'),
  ('Wok Chapaco', 'Pollo wok con verduras', 'https://www.themealdb.com/images/media/meals/el64dy1763483009.jpg'),
  ('Wok Chapaco', 'Chaufa de carne', 'https://www.themealdb.com/images/media/meals/wuyd2h1765655837.jpg'),
  ('Sushi Valle', 'Maki acevichado (10 u.)', 'https://www.themealdb.com/images/media/meals/g046bb1663960946.jpg'),
  ('Sushi Valle', 'Ramen de cerdo', 'https://www.themealdb.com/images/media/meals/ip5xtp1769779958.jpg'),
  ('Parrilla El Fogón', 'Churrasco con papas', 'https://www.themealdb.com/images/media/meals/vussxq1511882648.jpg'),
  ('Parrilla El Fogón', 'Parrillada para dos', 'https://www.themealdb.com/images/media/meals/kgfh3q1763075438.jpg'),
  ('Parrilla El Fogón', 'Burger del Fogón', 'https://www.themealdb.com/images/media/meals/j80gmw1764372176.jpg')
) as v (restaurante, plato, url)
join public.restaurantes r on r.nombre = v.restaurante
where p.restaurante_id = r.id
  and p.nombre = v.plato
  and (p.foto_url is null or p.foto_url like 'https://www.themealdb.com/%');

-- Para quitar todas las fotos temporales:
-- update public.platos set foto_url = null where foto_url like 'https://www.themealdb.com/%';
