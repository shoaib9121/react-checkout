import styles from "./Checkout.module.css";
import { LoadingIcon } from "./Icons";
import { getProducts } from "./dataService";
import React, { useEffect } from "react";

// You are provided with an incomplete <Checkout /> component.
// You are not allowed to add any additional HTML elements.
// You are not allowed to use refs.

// Demo video - You can view how the completed functionality should look at: https://drive.google.com/file/d/1o2Rz5HBOPOEp9DlvE9FWnLJoW9KUp5-C/view?usp=sharing

// Once the <Checkout /> component is mounted, load the products using the getProducts function.
// Once all the data is successfully loaded, hide the loading icon.
// Render each product object as a <Product/> component, passing in the necessary props.
// Implement the following functionality:
//  - The add and remove buttons should adjust the ordered quantity of each product
//  - The add and remove buttons should be enabled/disabled to ensure that the ordered quantity can’t be negative and can’t exceed the available count for that product.
//  - The total shown for each product should be calculated based on the ordered quantity and the price
//  - The total in the order summary should be calculated
//  - For orders over $1000, apply a 10% discount to the order. Display the discount text only if a discount has been applied.
//  - The total should reflect any discount that has been applied
//  - All dollar amounts should be displayed to 2 decimal places

const Product = ({
  id,
  name,
  availableCount,
  price,
  orderedQuantity,
  total,
  incrementDecrementHandler,
}) => {
  const incrementDecrement = (isIncrement) => {
    incrementDecrementHandler(id, isIncrement);
  };

  return (
    <tr>
      <td>{id}</td>
      <td>{name}</td>
      <td>{availableCount}</td>
      <td>${price}</td>
      <td>{orderedQuantity}</td>
      <td>${total}</td>
      <td>
        <button
          className={styles.actionButton}
          disabled={orderedQuantity >= availableCount}
          onClick={() => incrementDecrement(true)}
        >
          +
        </button>
        <button
          className={styles.actionButton}
          disabled={!orderedQuantity}
          onClick={() => incrementDecrement(false)}
        >
          -
        </button>
      </td>
    </tr>
  );
};

const Checkout = () => {
  const [products, setProducts] = React.useState([]);
  const [productId, setProductId] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDiscount, setIsDiscount] = React.useState(0);
  const [orderTotal, setOrderTotal] = React.useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const foundProd = products.find((product) => product.id === productId);
    if (foundProd) {
      updateQtyTotal(foundProd);
    }
    applyDiscountOnTotal();
  }, [products]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await getProducts();
      if (data) {
        data.forEach((item) => {
          item.orderedQuantity = 0;
          item.total = 0;
        });
        setProducts(data);
      }
    } catch (_e) {
      console.log(_e);
    } finally {
      setIsLoading(false);
    }
  };

  const getOrderTotal = () => {
    let som = products.reduce((sum, product) => sum + product.total, 0);
    if (som >= 1000) {
      let discount = som * 0.1;
      som = som - discount;
      setIsDiscount(Number(discount.toFixed(2)));
    } else {
      setIsDiscount(0);
    }
    return Number(som.toFixed(2)) || 0;
  };

  const applyDiscountOnTotal = () => {
    let total = getOrderTotal() || 0.0;
    setOrderTotal(Number(total.toFixed(2)));
  };

  const updateQtyTotal = (product = {}) =>
    Number((product?.price * product?.orderedQuantity).toFixed(2));

  const incrementDecrementHandler = (id, isIncrement = false) => {
    setProductId(id);
    let tempProducts = [...products];
    let foundProduct = tempProducts.find((item) => item.id === id);
    if (foundProduct) {
      if (
        isIncrement &&
        foundProduct.orderedQuantity >= foundProduct.availableCount
      ) {
        return;
      }
      foundProduct.orderedQuantity = isIncrement
        ? ++foundProduct.orderedQuantity
        : --foundProduct.orderedQuantity;
      foundProduct.total = Number(
        (foundProduct.orderedQuantity * foundProduct.price).toFixed(2)
      );
    }
    setProducts(tempProducts);
  };

  return (
    <div>
      <header className={styles.header}>
        <h1>Electro World</h1>
      </header>
      <main>
        {isLoading && <LoadingIcon />}

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product ID</th>
              <th>Product Name</th>
              <th># Available</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Total</th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {!!products.length &&
              products.map((product, index) => {
                return (
                  <Product
                    key={index + product.id}
                    {...product}
                    incrementDecrementHandler={incrementDecrementHandler}
                  />
                );
              })}
          </tbody>
        </table>
        <h2>Order summary</h2>
        {!!isDiscount && <p>Discount: $ {isDiscount} </p>}
        <p>Total: $ {!!products.length && orderTotal}</p>
      </main>
    </div>
  );
};

export default Checkout;
