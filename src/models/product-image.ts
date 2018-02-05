export class IProductImage {
    $key: string;
    file: File;
    location: string;
    name: string;
    tags: string;
    url: string;
    progress: number;
    createdAt: Date = new Date();
}
