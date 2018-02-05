import { IAddress } from "./address";

export class IProfile {
    $key: string;
    firstName: string;
    lastName: string;
    email: string
    phone: string;

    Addresses: IAddress[]
    profilePicUrl: string;
    isAdmin: boolean;
}