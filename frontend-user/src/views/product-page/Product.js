import React, { Component } from "react";
import "../../views/App.scss";
import "./ProductPage.scss";

class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
        id: "",
        name:"",
        description:"",
        price: "",
        stock_quantity: "",
        hand_size: "",
        grip_style: "",
        brand: ""
    };
  }
  render() {
    return (
      <></>
    );
  }
}

export default Product;