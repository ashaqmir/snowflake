import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";
import { Storage } from "@ionic/storage";

@Injectable()
export class StorageHelperProvider {
  constructor(private storage: Storage) {}

  clearStorage() {
    this.storage.clear();
  }

  getLastUser(): Promise<any> {
    return this.storage
      .get("lastUser")
      .then(value => {
        return value;
      })
      .catch(error => {
        console.log(error);
        return null;
      });
  }

  setLastUser(user) {
    return this.storage
      .set("lastUser", user)
      .then(value => {
        return value;
      })
      .catch(error => {
        console.log(error);
        return null;
      });
  }

  removeLastUser() {
    return this.storage
      .remove("lastUser")
      .then(res => {
        return true;
      })
      .catch(error => {
        console.log(error);
        return false;
      });
  }

  setItem(key, value) {
    this.storage.set(key, value);
  }

  getItem(key) {
    return this.storage.get(key);
  }
  
  removeItem(key) {
    this.storage.remove(key);
  }
}
