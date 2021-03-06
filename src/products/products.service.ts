import { Injectable } from '@nestjs/common';
import {Products} from './products.types'

@Injectable()
export class ProductsService {
    getProducts():Products {
        return [
            {
                name: "product1"
            },
            {
                name: "product2"
            },
            {
                name: "product3"
            }
        ]
    }
    getProduct(id: number): {id: number, info: string} {
        // fetch product with id
        return {
            info: 'Requested product',
            id: id
        }
    }
}
