import { IFeature } from './feature';
import { IProductImage } from './product-image';

export class IProduct {
    $key: string;
    name: boolean;
    shortDescription: string;
    longDescriptions: string;
    features: IFeature[];
    images: IProductImage[];
    currency: string;
    price = 0.0;
    taxPer = 0.0;
    discount = 0.0;
    discountPrice = 0.0;
    finalPrice = 0.0;

    pricefor = 1;
    personAddOption = 1;
    
    includes: string;
    isHot: boolean;
    enabled: boolean;

}
