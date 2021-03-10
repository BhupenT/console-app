export class FilterProducts {
  private filteredProducts: any[] = [];

  constructor(private byField: string = 'video_count', products: any[] = []) {
    if (products) {
      products.forEach((product) => {
        this.addProduct(product);
      });
    }
  }

  getAllProducts(): { [key: string]: any }[] {
    return this.filteredProducts;
  }

  getProduct(productIndex: number): { [key: string]: any } {
    return this.filteredProducts[productIndex];
  }

  addProduct(product: { [key: string]: any }): boolean {
    const currentCount = this.filteredProducts.length; // get count before adding
    product[this.byField]
      ? this.filteredProducts.unshift(product)
      : this.filteredProducts.push(product);
    return this.filteredProducts.length > currentCount ? true : false; // return true or false if its added or not
  }

  modifyProduct(
    productIndex: number,
    key: string,
    value: any,
  ): { [key: string]: any } {
    const requestedProduct = this.getProduct(productIndex);
    requestedProduct[key] = value;
    this.filteredProducts[productIndex] = requestedProduct;
    return this.filteredProducts[productIndex];
  }
}
